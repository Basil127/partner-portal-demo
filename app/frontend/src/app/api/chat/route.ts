import { streamText, generateText, convertToModelMessages, type UIMessage } from 'ai';
import { getModel } from '@/lib/ai/providers';
import { chatApi } from '@/lib/chat/api';

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
		const existingChat = await chatApi.getChat(id);
		if (!existingChat) {
			await chatApi.createChat({ id, title: 'New chat' });
		}

		// Save user message to backend if the last message is from user
		if (lastMessage?.role === 'user' && lastMessageText) {
			await chatApi.addMessage(id, {
				id: lastMessage.id,
				role: 'user',
				content: lastMessageText,
			});
		}

		const modelMessages = await convertToModelMessages(messages);

		// Generate title asynchronously for first user message
		const chatData = await chatApi.getChat(id);
		if (chatData?.messages?.length <= 1) {
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
			await chatApi.addMessage(chatId, {
				role: 'assistant',
				content: text,
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
			await chatApi.updateChatTitle(chatId, title.trim());
		}
	} catch (error) {
		console.error('Failed to generate chat title:', error);
	}
}
