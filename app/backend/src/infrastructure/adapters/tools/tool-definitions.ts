import { z } from 'zod';
import type { HotelContentService } from '../../../application/services/hotel-content/hotel-content-service.js';
import type { HotelContentRequestHeaders } from '@partner-portal/shared';

const DEFAULT_HEADERS: HotelContentRequestHeaders = {
	channelCode: 'OPERA',
};

/**
 * Shared tool definitions used by both the MCP server and the AI SDK.
 * Single source of truth for schemas, descriptions, and execution logic.
 *
 * To add a new tool:
 * 1. Add an entry to this array — both MCP and AI SDK pick it up automatically.
 * 2. If the tool needs a new service, add it to ToolDependencies.
 */

export interface ToolDependencies {
	hotelContentService: HotelContentService;
}

export interface ToolDefinition {
	name: string;
	title: string;
	description: string;
	inputSchema: z.ZodObject<z.ZodRawShape>;
	execute: (input: any) => Promise<any>;
}

export function createToolDefinitions(deps: ToolDependencies): ToolDefinition[] {
	const { hotelContentService } = deps;

	return [
		{
			name: 'list_hotels',
			title: 'List Hotels',
			description:
				'Returns a list of hotels/properties with summary information. Use this to find available hotels, see hotel names, codes, and connection status. Supports pagination and filtering by connection status.',
			inputSchema: z.object({
				limit: z
					.number()
					.int()
					.min(1)
					.optional()
					.describe('Maximum number of hotels to return'),
				offset: z
					.number()
					.int()
					.min(0)
					.optional()
					.describe('Number of hotels to skip for pagination'),
				connectionStatus: z
					.string()
					.optional()
					.describe('Filter by connection status (e.g. "active", "inactive")'),
			}),
			execute: async (input) => {
				return hotelContentService.getPropertiesSummary(
					{ limit: input.limit, offset: input.offset, connectionStatus: input.connectionStatus },
					DEFAULT_HEADERS,
				);
			},
		},
		{
			name: 'get_hotel_info',
			title: 'Get Hotel Info',
			description:
				'Returns detailed information about a specific hotel/property by its hotel code. Use this when the user asks about a specific hotel.',
			inputSchema: z.object({
				hotelCode: z
					.string()
					.describe('The unique hotel code identifier (e.g. "HOTEL1", "LONPK")'),
			}),
			execute: async (input) => {
				return hotelContentService.getPropertyInfo(input.hotelCode, DEFAULT_HEADERS);
			},
		},
		{
			name: 'get_hotel_room_types',
			title: 'Get Hotel Room Types',
			description:
				'Returns room types available at a specific hotel. Use this when the user asks about rooms or room types at a hotel. Supports pagination and filtering by room type.',
			inputSchema: z.object({
				hotelCode: z
					.string()
					.describe('The unique hotel code identifier (e.g. "HOTEL1", "LONPK")'),
				roomType: z
					.string()
					.optional()
					.describe('Filter by specific room type code'),
				limit: z
					.number()
					.int()
					.min(1)
					.optional()
					.describe('Maximum number of room types to return'),
				offset: z
					.number()
					.int()
					.min(0)
					.optional()
					.describe('Number of room types to skip for pagination'),
			}),
			execute: async (input) => {
				return hotelContentService.getRoomTypes(
					input.hotelCode,
					{ roomType: input.roomType, limit: input.limit, offset: input.offset },
					DEFAULT_HEADERS,
				);
			},
		},
	];
}
