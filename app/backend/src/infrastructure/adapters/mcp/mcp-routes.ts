import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createMcpServer } from './mcp-server.js';
import { randomUUID } from 'node:crypto';
import type { ServiceContainer } from '../../service-container.js';
import { config } from '../../config/config.js';

/**
 * Simple shared-secret check for the /mcp endpoint (POC-grade, not real auth).
 * Accepts the token via `Authorization: Bearer <token>` or an `x-mcp-token` header.
 * Returns true if authorized; otherwise sends a 401 and returns false.
 */
function checkMcpAuth(request: FastifyRequest, reply: FastifyReply): boolean {
	const expected = config.mcp.authToken;
	if (!expected) return true; // no token configured → endpoint left open

	const authHeader = request.headers['authorization'];
	const bearer =
		typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
			? authHeader.slice('Bearer '.length).trim()
			: undefined;
	const headerToken = request.headers['x-mcp-token'];
	const provided = bearer ?? (typeof headerToken === 'string' ? headerToken : undefined);

	if (provided === expected) return true;

	reply.code(401).send({
		jsonrpc: '2.0',
		error: { code: -32001, message: 'Unauthorized: missing or invalid MCP token' },
		id: null,
	});
	return false;
}

export async function setupMcpRoutes(fastify: FastifyInstance, services: ServiceContainer) {
	// Map of active transports by session ID
	const transports = new Map<string, StreamableHTTPServerTransport>();

	// POST /mcp — Handle JSON-RPC messages (initialize, tools/list, tools/call, etc.)
	fastify.post('/mcp', async (request, reply) => {
		if (!checkMcpAuth(request, reply)) return reply;

		const sessionId = request.headers['mcp-session-id'] as string | undefined;

		// If we have a session ID, reuse the existing transport
		if (sessionId && transports.has(sessionId)) {
			const transport = transports.get(sessionId)!;
			await transport.handleRequest(request.raw, reply.raw, request.body);
			return reply;
		}

		// New session — create a fresh McpServer + transport pair
		const mcpServer = createMcpServer({
			hotelContentService: services.hotelContentService,
			hotelReservationsService: services.hotelReservationsService,
			hotelShopService: services.hotelShopService,
		});
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
		if (!checkMcpAuth(request, reply)) return reply;

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
		if (!checkMcpAuth(request, reply)) return reply;

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
