export interface Chat {
	id: string;
	title: string;
	createdAt: string;
	updatedAt: string;
}

export interface ChatMessage {
	id: string;
	chatId: string;
	role: 'user' | 'assistant' | 'system';
	content: string;
	createdAt: string;
}

export interface ChatWithMessages {
	chat: Chat;
	messages: ChatMessage[];
}

export interface ChatHistoryResponse {
	chats: Chat[];
	total: number;
}
