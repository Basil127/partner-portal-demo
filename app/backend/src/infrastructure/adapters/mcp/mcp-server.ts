import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

export function createMcpServer() {
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

	// Register the get_time tool
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

	return server;
}
