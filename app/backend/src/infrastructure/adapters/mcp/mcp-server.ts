import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { createToolDefinitions, type ToolDependencies } from '../tools/tool-definitions.js';

export function createMcpServer(deps: ToolDependencies) {
	const server = new McpServer(
		{
			name: 'partner-portal-mcp',
			version: '1.0.0',
		},
		{
			capabilities: {
				tools: {},
			},
		},
	);

	// Register the get_time tool (MCP-only, not relevant for AI SDK)
	server.registerTool(
		'get_time',
		{
			title: 'Get Current Time',
			description:
				'Returns the current server date and time in ISO 8601 format with additional formatted representations.',
			inputSchema: {
				timezone: z
					.string()
					.optional()
					.describe(
						'IANA timezone identifier (e.g. "Europe/London", "America/New_York"). Defaults to UTC.',
					),
			},
		},
		async ({ timezone }) => {
			const now = new Date();
			const tz = timezone || 'UTC';

			let formatted: string;
			try {
				formatted = now.toLocaleString('en-US', {
					timeZone: tz,
					weekday: 'long',
					year: 'numeric',
					month: 'long',
					day: 'numeric',
					hour: '2-digit',
					minute: '2-digit',
					second: '2-digit',
					timeZoneName: 'short',
				});
			} catch {
				formatted = now.toLocaleString('en-US', {
					timeZone: 'UTC',
					weekday: 'long',
					year: 'numeric',
					month: 'long',
					day: 'numeric',
					hour: '2-digit',
					minute: '2-digit',
					second: '2-digit',
					timeZoneName: 'short',
				});
			}

			return {
				content: [
					{
						type: 'text' as const,
						text: JSON.stringify(
							{
								iso: now.toISOString(),
								formatted,
								timezone: tz,
								unix: Math.floor(now.getTime() / 1000),
							},
							null,
							2,
						),
					},
				],
			};
		},
	);

	// Register shared tools from tool-definitions (single source of truth)
	const toolDefs = createToolDefinitions(deps);
	for (const def of toolDefs) {
		// MCP inputSchema expects a flat record of Zod fields, extract from ZodObject shape
		const shape = def.inputSchema.shape as Record<string, z.ZodTypeAny>;

		server.registerTool(
			def.name,
			{
				title: def.title,
				description: def.description,
				inputSchema: shape,
			},
			async (input) => {
				try {
					const result = await def.execute(input);
					return {
						content: [
							{
								type: 'text' as const,
								text: JSON.stringify(result, null, 2),
							},
						],
					};
				} catch (error) {
					return {
						content: [
							{
								type: 'text' as const,
								text: `Error in ${def.name}: ${error instanceof Error ? error.message : String(error)}`,
							},
						],
						isError: true,
					};
				}
			},
		);
	}

	return server;
}
