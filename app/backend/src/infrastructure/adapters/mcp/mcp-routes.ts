import type { FastifyInstance } from 'fastify';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createMcpServer } from './mcp-server.js';
import { randomUUID } from 'node:crypto';

export async function setupMcpRoutes(fastify: FastifyInstance) {
	// Map of active transports by session ID
	const transports = new Map<string, StreamableHTTPServerTransport>();

	// POST /mcp — Handle JSON-RPC messages (initialize, tools/list, tools/call, etc.)
	fastify.post('/mcp', async (request, reply) => {
		const sessionId = request.headers['mcp-session-id'] as string | undefined;

		// If we have a session ID, reuse the existing transport
		if (sessionId && transports.has(sessionId)) {
			const transport = transports.get(sessionId)!;
			await transport.handleRequest(request.raw, reply.raw, request.body);
			return reply;
		}

		// New session — create a fresh McpServer + transport pair
		const mcpServer = createMcpServer();
		const transport = new StreamableHTTPServerTransport({
			sessionIdGenerator: () => randomUUID(),
			onsessioninitialized: (newSessionId) => {
				transports.set(newSessionId, transport);
			},
		});

		// Clean up on close
		transport.onclose = () => {
			const sid = transport.sessionId;
			if (sid) {
				transports.delete(sid);
			}
		};

		await mcpServer.server.connect(transport);
		await transport.handleRequest(request.raw, reply.raw, request.body);
		return reply;
	});

	// GET /mcp — SSE stream for server-to-client notifications
	fastify.get('/mcp', async (request, reply) => {
		const sessionId = request.headers['mcp-session-id'] as string | undefined;

		if (!sessionId || !transports.has(sessionId)) {
			reply.code(400).send({ error: 'Invalid or missing session ID' });
			return;
		}

		const transport = transports.get(sessionId)!;
		await transport.handleRequest(request.raw, reply.raw);
		return reply;
	});

	// DELETE /mcp — Close a session
	fastify.delete('/mcp', async (request, reply) => {
		const sessionId = request.headers['mcp-session-id'] as string | undefined;

		if (!sessionId || !transports.has(sessionId)) {
			reply.code(400).send({ error: 'Invalid or missing session ID' });
			return;
		}

		const transport = transports.get(sessionId)!;
		await transport.handleRequest(request.raw, reply.raw);
		return reply;
	});

	fastify.log.info('MCP routes registered at /mcp');
}
