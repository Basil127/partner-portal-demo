export interface Chat {
	id: string;
	title: string;
	createdAt: Date;
	updatedAt: Date;
}

export enum MessageRole {
	USER = 'user',
	ASSISTANT = 'assistant',
	SYSTEM = 'system',
}

export type MessageRoleValue = 'user' | 'assistant' | 'system';

export interface Message {
	id: string;
	chatId: string;
	role: MessageRole;
	content: string;
	createdAt: Date;
}

export interface CreateChatData {
	id?: string;
	title: string;
}

export interface CreateMessageData {
	id?: string;
	chatId: string;
	role: MessageRoleValue;
	content: string;
}
