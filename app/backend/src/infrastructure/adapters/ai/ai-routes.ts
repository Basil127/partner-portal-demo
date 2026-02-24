import type { FastifyInstance } from 'fastify';
import {
	streamText,
	generateText,
	convertToModelMessages,
	tool,
	stepCountIs,
	hasToolCall,
	type UIMessage,
} from 'ai';
import { getModel } from './providers.js';
import type { ServiceContainer } from '../../service-container.js';
import { createToolDefinitions } from '../tools/tool-definitions.js';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const systemPrompt = fs.readFileSync(resolve(__dirname, 'system.md'), 'utf-8');

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

			// Save user message — deduplicate by ID to handle retries gracefully.
			// Re-read existingChat AFTER potential creation so the message list is current.
			// The DB INSERT also uses ON CONFLICT DO NOTHING as a final safety net.
			if (lastMessage?.role === 'user' && lastMessageText) {
				const chatAfterCreate = existingChat ?? (await chatService.getChatWithMessages(id));
				const existingMessageIds = chatAfterCreate?.messages?.map((m) => m.id) ?? [];
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
				stopWhen: [stepCountIs(5), hasToolCall('create_reservation')],
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

/**
 * Strips the model's internal reasoning markers from text before it is
 * persisted to the DB or displayed to the user.
 *
 * This model emits chain-of-thought inline in its text stream using proprietary
 * markers: analysis, assistantcommentary, assistantfinal.
 *
 * Strategy:
 *  1. If "assistantfinal" is present → keep only what comes after the last one.
 *  2. If thinking markers present but no "assistantfinal" → still streaming; discard.
 *  3. Otherwise → strip bare "assistant" / marker words that leaked through.
 */
const THINKING_MARKER_RE = /\b(assistantfinal|assistantcommentary|assistant)\b/gi;

function stripThinkingTokens(text: string): string {
	const finalMarker = 'assistantfinal';
	const finalIdx = text.lastIndexOf(finalMarker);
	if (finalIdx !== -1) {
		const after = text.slice(finalIdx + finalMarker.length).trimStart();
		return after
			.replace(THINKING_MARKER_RE, '')
			.replace(/\s{2,}/g, ' ')
			.trim();
	}
	if (text.includes('analysis') || text.includes('assistantcommentary')) {
		return '';
	}
	return text
		.replace(THINKING_MARKER_RE, '')
		.replace(/\s{2,}/g, ' ')
		.trim();
}

async function saveAssistantResponse(
	chatService: ServiceContainer['chatService'],
	chatId: string,
	result: { text: PromiseLike<string>; response: PromiseLike<{ messages: any[] }> },
) {
	try {
		const [text, response] = await Promise.all([result.text, result.response]);
		const modelMessages: any[] = response?.messages ?? [];

		// Reconstruct a single UIMessage parts array that mirrors what the AI SDK emits on the client.
		// Model messages alternate: assistant (text + tool-calls) → tool (results) → assistant (text) …
		// We flatten them all into one parts array so the full conversation turn is stored together.
		const combinedParts: any[] = [];
		// Track tool-call parts by ID so we can patch in the result when the tool message arrives.
		const toolCallIndex = new Map<string, number>();

		for (const msg of modelMessages) {
			if (msg.role === 'assistant') {
				const content = Array.isArray(msg.content) ? msg.content : [];
				for (const part of content) {
					if (part.type === 'text' && part.text) {
						combinedParts.push({ type: 'text', text: part.text });
					} else if (part.type === 'tool-call') {
						const idx = combinedParts.length;
						toolCallIndex.set(part.toolCallId, idx);
						combinedParts.push({
							type: `tool-${part.toolName}`,
							toolName: part.toolName,
							toolCallId: part.toolCallId,
							state: 'call',
							input: part.input ?? part.args ?? {},
							output: null,
							isError: false,
						});
					}
				}
			} else if (msg.role === 'tool') {
				const content = Array.isArray(msg.content) ? msg.content : [];
				for (const part of content) {
					if (part.type === 'tool-result') {
						const idx = toolCallIndex.get(part.toolCallId);
						if (idx !== undefined) {
							combinedParts[idx] = {
								...combinedParts[idx],
								state: part.isError ? 'output-error' : 'output-available',
								// AI SDK v5+ uses `output`; older builds may use `result`.
								// Some SDK internals embed the raw value in `content` when it
								// is not an array (bare scalar / object, not a content-part array).
								output:
									part.output ??
									part.result ??
									(part.content != null && !Array.isArray(part.content) ? part.content : null) ??
									null,
								isError: !!part.isError,
							};
						}
					}
				}
			}
		}

		// Strip any reasoning markers that leaked into the text before persisting.
		const cleanParts = combinedParts.map((p) =>
			p.type === 'text' ? { ...p, text: stripThinkingTokens(p.text) } : p,
		);
		const cleanText = stripThinkingTokens(text);

		const hasContent = cleanText || cleanParts.some((p) => p.type !== 'text' || p.text);
		if (hasContent) {
			await chatService.addMessage({
				chatId,
				role: 'assistant',
				content: cleanText,
				parts: cleanParts.length > 0 ? JSON.stringify(cleanParts) : undefined,
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
