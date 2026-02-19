import { MessageRole } from '../../domain/models/chat.js';
import type { Chat, CreateChatData, CreateMessageData, Message } from '../../domain/models/chat.js';
import type { ChatRepository } from '../../domain/repositories/chat-repository.js';
import type { DatabaseAdapter } from '../adapters/database.js';
import { randomUUID } from 'crypto';

export class ChatRepositoryImpl implements ChatRepository {
	constructor(private db: DatabaseAdapter) {}

	async createChat(data: CreateChatData): Promise<Chat> {
		const id = data.id || randomUUID();
		const now = new Date();

		await this.db.execute(
			`INSERT INTO chats (id, title, created_at, updated_at)
       VALUES (?, ?, ?, ?)`,
			[id, data.title, now.toISOString(), now.toISOString()],
		);

		const chat = await this.findChatById(id);
		if (!chat) {
			throw new Error('Failed to create chat');
		}
		return chat;
	}

	async findChatById(id: string): Promise<Chat | null> {
		const rows = await this.db.query('SELECT * FROM chats WHERE id = ?', [id]);
		return rows.length > 0 ? this.mapToChat(rows[0] as Record<string, unknown>) : null;
	}

	async findAllChats(limit = 50, offset = 0): Promise<Chat[]> {
		const rows = await this.db.query(
			'SELECT * FROM chats ORDER BY updated_at DESC LIMIT ? OFFSET ?',
			[limit, offset],
		);
		return rows.map((row) => this.mapToChat(row as Record<string, unknown>));
	}

	async deleteChat(id: string): Promise<boolean> {
		const existing = await this.findChatById(id);
		if (!existing) {
			return false;
		}

		// Delete messages first (for DBs without CASCADE support)
		await this.db.execute('DELETE FROM messages WHERE chat_id = ?', [id]);
		await this.db.execute('DELETE FROM chats WHERE id = ?', [id]);
		return true;
	}

	async updateChatTitle(id: string, title: string): Promise<Chat | null> {
		const existing = await this.findChatById(id);
		if (!existing) {
			return null;
		}

		await this.db.execute('UPDATE chats SET title = ?, updated_at = ? WHERE id = ?', [
			title,
			new Date().toISOString(),
			id,
		]);

		return this.findChatById(id);
	}

	async addMessage(data: CreateMessageData): Promise<Message> {
		const id = data.id || randomUUID();
		const now = new Date();

		await this.db.execute(
			`INSERT INTO messages (id, chat_id, role, content, parts, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
			[id, data.chatId, data.role, data.content, data.parts ?? null, now.toISOString()],
		);

		// Update the chat's updated_at timestamp
		await this.db.execute('UPDATE chats SET updated_at = ? WHERE id = ?', [
			now.toISOString(),
			data.chatId,
		]);

		const messages = await this.db.query('SELECT * FROM messages WHERE id = ?', [id]);
		if (messages.length === 0) {
			throw new Error('Failed to create message');
		}
		return this.mapToMessage(messages[0] as Record<string, unknown>);
	}

	async findMessagesByChatId(chatId: string): Promise<Message[]> {
		const rows = await this.db.query(
			'SELECT * FROM messages WHERE chat_id = ? ORDER BY created_at ASC',
			[chatId],
		);
		return rows.map((row) => this.mapToMessage(row as Record<string, unknown>));
	}

	async countChats(): Promise<number> {
		const rows = await this.db.query('SELECT COUNT(*) as count FROM chats');
		return (rows[0] as Record<string, unknown>).count as number;
	}

	private mapToChat(row: Record<string, unknown>): Chat {
		return {
			id: row.id as string,
			title: row.title as string,
			createdAt: new Date(row.created_at as string),
			updatedAt: new Date(row.updated_at as string),
		};
	}

	private mapToMessage(row: Record<string, unknown>): Message {
		return {
			id: row.id as string,
			chatId: row.chat_id as string,
			role: row.role as MessageRole,
			content: row.content as string,
			parts: row.parts as string | undefined,
			createdAt: new Date(row.created_at as string),
		};
	}
}
