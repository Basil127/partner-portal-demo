import type { Chat, CreateChatData, CreateMessageData, Message } from '../models/chat.js';

export interface ChatRepository {
	createChat(data: CreateChatData): Promise<Chat>;
	findChatById(id: string): Promise<Chat | null>;
	findAllChats(limit?: number, offset?: number): Promise<Chat[]>;
	deleteChat(id: string): Promise<boolean>;
	updateChatTitle(id: string, title: string): Promise<Chat | null>;
	addMessage(data: CreateMessageData): Promise<Message>;
	findMessagesByChatId(chatId: string): Promise<Message[]>;
	countChats(): Promise<number>;
}
