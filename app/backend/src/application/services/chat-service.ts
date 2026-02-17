import type { Chat, CreateChatData, CreateMessageData, Message } from '../../domain/models/chat.js';
import type { ChatRepository } from '../../domain/repositories/chat-repository.js';

export class ChatService {
	constructor(private chatRepository: ChatRepository) {}

	async createChat(data: CreateChatData): Promise<Chat> {
		return this.chatRepository.createChat(data);
	}

	async getChat(id: string): Promise<Chat | null> {
		return this.chatRepository.findChatById(id);
	}

	async getChatWithMessages(id: string): Promise<{ chat: Chat; messages: Message[] } | null> {
		const chat = await this.chatRepository.findChatById(id);
		if (!chat) {
			return null;
		}
		const messages = await this.chatRepository.findMessagesByChatId(id);
		return { chat, messages };
	}

	async getChatHistory(limit?: number, offset?: number): Promise<{ chats: Chat[]; total: number }> {
		const [chats, total] = await Promise.all([
			this.chatRepository.findAllChats(limit, offset),
			this.chatRepository.countChats(),
		]);
		return { chats, total };
	}

	async deleteChat(id: string): Promise<boolean> {
		return this.chatRepository.deleteChat(id);
	}

	async addMessage(data: CreateMessageData): Promise<Message> {
		// Verify chat exists
		const chat = await this.chatRepository.findChatById(data.chatId);
		if (!chat) {
			throw new Error('Chat not found');
		}

		return this.chatRepository.addMessage(data);
	}

	async getChatMessages(chatId: string): Promise<Message[]> {
		return this.chatRepository.findMessagesByChatId(chatId);
	}

	async updateChatTitle(id: string, title: string): Promise<Chat | null> {
		if (!title || title.trim().length === 0) {
			throw new Error('Title cannot be empty');
		}
		return this.chatRepository.updateChatTitle(id, title.trim());
	}
}
