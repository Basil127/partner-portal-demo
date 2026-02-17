import type { FastifyRequest, FastifyReply } from 'fastify';
import { ChatService } from '../../application/services/chat-service.js';
import type { CreateChatData, CreateMessageData } from '../../domain/models/chat.js';
import { z } from 'zod';

const CreateChatSchema = z.object({
	id: z.string().optional(),
	title: z.string().min(1).default('New chat'),
});

const AddMessageSchema = z.object({
	id: z.string().optional(),
	role: z.enum(['user', 'assistant', 'system']),
	content: z.string().min(1),
});

const UpdateChatTitleSchema = z.object({
	title: z.string().min(1),
});

const PaginationSchema = z.object({
	limit: z.coerce.number().int().min(1).max(100).default(50),
	offset: z.coerce.number().int().min(0).default(0),
});

export class ChatController {
	constructor(private chatService: ChatService) {}

	async createChat(request: FastifyRequest, reply: FastifyReply) {
		try {
			const validatedData = CreateChatSchema.parse(request.body);
			const data: CreateChatData = {
				id: validatedData.id,
				title: validatedData.title,
			};

			const chat = await this.chatService.createChat(data);
			return reply.status(201).send(chat);
		} catch (error) {
			request.log.error(error);
			if (error instanceof z.ZodError) {
				const details = error.issues ?? (error as unknown as { errors: unknown }).errors;
				return reply.status(400).send({ error: 'Validation error', details });
			}
			return reply.status(500).send({ error: 'Internal server error' });
		}
	}

	async getChat(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
		try {
			const result = await this.chatService.getChatWithMessages(request.params.id);
			if (!result) {
				return reply.status(404).send({ error: 'Chat not found' });
			}
			return reply.send(result);
		} catch (error) {
			request.log.error(error);
			return reply.status(500).send({ error: 'Internal server error' });
		}
	}

	async listChats(request: FastifyRequest, reply: FastifyReply) {
		try {
			const { limit, offset } = PaginationSchema.parse(request.query);
			const result = await this.chatService.getChatHistory(limit, offset);
			return reply.send(result);
		} catch (error) {
			request.log.error(error);
			if (error instanceof z.ZodError) {
				const details = error.issues ?? (error as unknown as { errors: unknown }).errors;
				return reply.status(400).send({ error: 'Validation error', details });
			}
			return reply.status(500).send({ error: 'Internal server error' });
		}
	}

	async deleteChat(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
		try {
			const deleted = await this.chatService.deleteChat(request.params.id);
			if (!deleted) {
				return reply.status(404).send({ error: 'Chat not found' });
			}
			return reply.status(204).send();
		} catch (error) {
			request.log.error(error);
			return reply.status(500).send({ error: 'Internal server error' });
		}
	}

	async addMessage(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
		try {
			const validatedData = AddMessageSchema.parse(request.body);
			const data: CreateMessageData = {
				id: validatedData.id,
				chatId: request.params.id,
				role: validatedData.role,
				content: validatedData.content,
			};

			const message = await this.chatService.addMessage(data);
			return reply.status(201).send(message);
		} catch (error) {
			request.log.error(error);
			if (error instanceof z.ZodError) {
				const details = error.issues ?? (error as unknown as { errors: unknown }).errors;
				return reply.status(400).send({ error: 'Validation error', details });
			}
			if (error instanceof Error && error.message === 'Chat not found') {
				return reply.status(404).send({ error: 'Chat not found' });
			}
			return reply.status(500).send({ error: 'Internal server error' });
		}
	}

	async updateChatTitle(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
		try {
			const validatedData = UpdateChatTitleSchema.parse(request.body);
			const chat = await this.chatService.updateChatTitle(request.params.id, validatedData.title);
			if (!chat) {
				return reply.status(404).send({ error: 'Chat not found' });
			}
			return reply.send(chat);
		} catch (error) {
			request.log.error(error);
			if (error instanceof z.ZodError) {
				const details = error.issues ?? (error as unknown as { errors: unknown }).errors;
				return reply.status(400).send({ error: 'Validation error', details });
			}
			if (error instanceof Error && error.message === 'Title cannot be empty') {
				return reply.status(400).send({ error: error.message });
			}
			return reply.status(500).send({ error: 'Internal server error' });
		}
	}
}
