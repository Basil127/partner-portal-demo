import { streamText, generateText, convertToModelMessages, type UIMessage } from 'ai';
import { getModel } from '@/lib/ai/providers';
import { getApiChatsById, postApiChats, postApiChatsByIdMessages, patchApiChatsById } from '@/lib/api-client';
import { serverClient } from '@/lib/chat/server-client';

export const maxDuration = 60;

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const { id, messages } = body as {
			id: string;
			messages?: UIMessage[];
		};

		if (!id) {
			return new Response(JSON.stringify({ error: 'Chat ID is required' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		if (!messages || messages.length === 0) {
			return new Response(JSON.stringify({ error: 'Messages are required' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		// Extract the last user message text from parts
		const lastMessage = messages[messages.length - 1];
		const lastMessageText =
			lastMessage?.parts
				?.filter((p): p is { type: 'text'; text: string } => p.type === 'text')
				.map((p) => p.text)
				.join('\n') || '';

		// Check if chat exists, if not create it
		const { data: existingChat } = await getApiChatsById({
			path: { id },
			client: serverClient,
		});
		if (!existingChat) {
			await postApiChats({
				body: { id, title: 'New chat' },
				client: serverClient,
			});
		}

		// Save user message to backend if the last message is from user
		// Guard against duplicates by checking if this message ID already exists
		if (lastMessage?.role === 'user' && lastMessageText) {
			const existingMessageIds = existingChat?.messages?.map((m) => m.id) ?? [];
			if (!existingMessageIds.includes(lastMessage.id)) {
				await postApiChatsByIdMessages({
					path: { id },
					body: {
						id: lastMessage.id,
						role: 'user',
						content: lastMessageText,
					},
					client: serverClient,
				});
			}
		}

		const modelMessages = await convertToModelMessages(messages);

		// Generate title asynchronously for first user message
		const { data: chatData } = await getApiChatsById({
			path: { id },
			client: serverClient,
		});
		if ((chatData?.messages?.length ?? 0) <= 1) {
			generateTitle(id, lastMessageText);
		}

		// Stream AI response
		const result = streamText({
			model: getModel(),
			system:
				'You are a helpful hotel management assistant. You help hotel partners with bookings, reservations, room management, and other hospitality-related tasks. Be concise, professional, and helpful.',
			messages: modelMessages,
		});

		// Save assistant message after stream completes (fire and forget)
		saveAssistantResponse(id, result);

		return result.toUIMessageStreamResponse();
	} catch (error) {
		console.error('Chat API error:', error);
		return new Response(JSON.stringify({ error: 'Internal server error' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
}

async function saveAssistantResponse(chatId: string, result: ReturnType<typeof streamText>) {
	try {
		const text = await result.text;
		if (text) {
			await postApiChatsByIdMessages({
				path: { id: chatId },
				body: {
					role: 'assistant',
					content: text,
				},
				client: serverClient,
			});
		}
	} catch (error) {
		console.error('Failed to save assistant response:', error);
	}
}

async function generateTitle(chatId: string, userMessage: string) {
	try {
		const { text: title } = await generateText({
			model: getModel(),
			system:
				'Generate a short title (max 6 words) for a chat that starts with this message. Return only the title, no quotes or punctuation.',
			prompt: userMessage,
		});

		if (title) {
			await patchApiChatsById({
				path: { id: chatId },
				body: { title: title.trim() },
				client: serverClient,
			});
		}
	} catch (error) {
		console.error('Failed to generate chat title:', error);
	}
}
