import type { FastifyInstance } from 'fastify';
import {
	streamText,
	generateText,
	convertToModelMessages,
	tool,
	stepCountIs,
	type UIMessage,
} from 'ai';
import { getModel } from './providers.js';
import type { ServiceContainer } from '../../service-container.js';
import { createToolDefinitions } from '../tools/tool-definitions.js';
import fs from 'fs';

const systemPrompt = fs.readFileSync('src/infrastructure/adapters/ai/system.md', 'utf-8');


export async function setupAiRoutes(fastify: FastifyInstance, services: ServiceContainer) {
	const { chatService } = services;

	// Build AI SDK tools from shared definitions (single source of truth)
	const toolDefs = createToolDefinitions({
		hotelContentService: services.hotelContentService,
		hotelReservationsService: services.hotelReservationsService,
		hotelShopService: services.hotelShopService,
	});
	const aiTools: Record<string, any> = {};
	for (const def of toolDefs) {
		aiTools[def.name] = tool({
			description: def.description,
			inputSchema: def.inputSchema,
			execute: async (input: unknown) => def.execute(input),
		});
	}

	fastify.post('/api/ai/chat', async (request, reply) => {
		try {
			const body = request.body as { id?: string; messages?: UIMessage[] };
			const { id, messages } = body;

			if (!id) {
				return reply.code(400).send({ error: 'Chat ID is required' });
			}

			if (!messages || messages.length === 0) {
				return reply.code(400).send({ error: 'Messages are required' });
			}

			// Extract last user message text from parts
			const lastMessage = messages[messages.length - 1];
			const lastMessageText =
				lastMessage?.parts
					?.filter((p: { type: string }): p is { type: 'text'; text: string } => p.type === 'text')
					.map((p: { type: 'text'; text: string }) => p.text)
					.join('\n') || '';

			// Check if chat exists, create if not
			const existingChat = await chatService.getChatWithMessages(id);
			if (!existingChat) {
				await chatService.createChat({ id, title: 'New chat' });
			}

			// Save user message (deduplicate by ID)
			if (lastMessage?.role === 'user' && lastMessageText) {
				const existingMessageIds = existingChat?.messages?.map((m) => m.id) ?? [];
				if (!existingMessageIds.includes(lastMessage.id)) {
					await chatService.addMessage({
						id: lastMessage.id,
						chatId: id,
						role: 'user',
						content: lastMessageText,
					});
				}
			}

			const modelMessages = await convertToModelMessages(messages);

			// Generate title asynchronously for first user message
			const chatData = await chatService.getChatWithMessages(id);
			if ((chatData?.messages?.length ?? 0) <= 1) {
				generateTitle(chatService, id, lastMessageText);
			}

			// Stream AI response with tools
			const result = streamText({
				model: getModel(),
				system: systemPrompt + `Today's date is: ${new Date().toISOString().split('T')[0]}.`,
				messages: modelMessages,
				tools: aiTools,
				stopWhen: stepCountIs(5),
			});

			// Save assistant response after stream completes (fire and forget)
			saveAssistantResponse(chatService, id, result);

			// Stream the response to the client using the Web Response API
			const response = result.toUIMessageStreamResponse();

			// Set response headers — include CORS headers since we're using reply.raw
			const headerRecord: Record<string, string> = {};
			response.headers.forEach((value, key) => {
				headerRecord[key] = value;
			});

			// Add CORS headers explicitly (reply.raw bypasses Fastify's CORS plugin)
			const origin = (request.headers.origin as string) || '';
			headerRecord['access-control-allow-origin'] = origin;
			headerRecord['access-control-allow-credentials'] = 'true';

			reply.raw.writeHead(response.status, headerRecord);

			// Pipe the response body to Fastify's raw response
			if (response.body) {
				const reader = response.body.getReader();
				const pump = async () => {
					while (true) {
						const { done, value } = await reader.read();
						if (done) {
							reply.raw.end();
							break;
						}
						reply.raw.write(value);
					}
				};
				pump().catch((err) => {
					fastify.log.error(err, 'Stream pipe error');
					reply.raw.end();
				});
			} else {
				reply.raw.end();
			}

			return reply;
		} catch (error) {
			fastify.log.error(error, 'AI Chat error');
			return reply.code(500).send({ error: 'Internal server error' });
		}
	});

	fastify.log.info('AI chat routes registered at /api/ai/chat');
}

async function saveAssistantResponse(
	chatService: ServiceContainer['chatService'],
	chatId: string,
	result: { text: PromiseLike<string>; response: PromiseLike<{ messages: any[] }> },
) {
	try {
		const [text, response] = await Promise.all([result.text, result.response]);
		// Find the last assistant message from the response to persist its parts
		const assistantMessages = response?.messages?.filter((m: any) => m.role === 'assistant') ?? [];
		const lastAssistant = assistantMessages[assistantMessages.length - 1];
		const parts = lastAssistant?.parts;

		// Save when there is text OR when there are tool-call parts (e.g. tool-only turns with no prose)
		if (text || (Array.isArray(parts) && parts.length > 0)) {
			await chatService.addMessage({
				chatId,
				role: 'assistant',
				content: text,
				parts: parts ? JSON.stringify(parts) : undefined,
			});
		}
	} catch (error) {
		console.error('Failed to save assistant response:', error);
	}
}

async function generateTitle(
	chatService: ServiceContainer['chatService'],
	chatId: string,
	userMessage: string,
) {
	try {
		const { text: title } = await generateText({
			model: getModel(),
			system:
				'Generate a short title (max 6 words) for a chat that starts with this message. Return only the title, no quotes or punctuation.',
			prompt: userMessage,
		});

		if (title) {
			await chatService.updateChatTitle(chatId, title.trim());
		}
	} catch (error) {
		console.error('Failed to generate chat title:', error);
	}
}
