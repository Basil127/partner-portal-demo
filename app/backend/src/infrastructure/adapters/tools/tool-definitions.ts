import { z } from 'zod';
import type { HotelContentService } from '../../../application/services/hotel-content/hotel-content-service.js';
import type { HotelReservationsService } from '../../../application/services/hotel-reservations/hotel-reservations-service.js';
import type { HotelShopService } from '../../../application/services/hotel-shop/hotel-shop-service.js';
import type {
	HotelContentRequestHeaders,
	HotelReservationsRequestHeaders,
	HotelShopRequestHeaders,
} from '@partner-portal/shared';

const DEFAULT_HEADERS: HotelContentRequestHeaders = {
	channelCode: 'OPERA',
};

const DEFAULT_RESERVATIONS_HEADERS: HotelReservationsRequestHeaders = {
	channelCode: 'OPERA',
};

const DEFAULT_SHOP_HEADERS: HotelShopRequestHeaders = {
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
	hotelReservationsService: HotelReservationsService;
	hotelShopService: HotelShopService;
}

export interface ToolDefinition {
	name: string;
	title: string;
	description: string;
	inputSchema: z.ZodObject<z.ZodRawShape>;
	execute: (input: any) => Promise<any>;
}

export function createToolDefinitions(deps: ToolDependencies): ToolDefinition[] {
	const { hotelContentService, hotelReservationsService, hotelShopService } = deps;

	return [
		{
			name: 'list_hotels',
			title: 'List Hotels',
			description:
				'Returns a list of hotels/properties with summary information. Use this to find available hotels, see hotel names, codes, and connection status. Supports pagination and filtering by connection status.',
			inputSchema: z.object({
				limit: z.number().int().min(1).optional().describe('Maximum number of hotels to return'),
				offset: z
					.number()
					.int()
					.min(0)
					.optional()
					.describe('Number of hotels to skip for pagination'),
				connectionStatus: z
					.string()
					.optional()
					.describe('Filter by connection status (e.g. "active", "inactive"), default to inactive'),
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
				'Returns detailed information about a specific hotel/property by its hotel code. Use this after listing hotels to get more details about a selected hotel.',
			inputSchema: z.object({
				hotelCode: z.string().describe('The unique hotel code identifier (e.g. "HOTEL1", "LONPK")'),
			}),
			execute: async (input) => {
				return hotelContentService.getPropertyInfo(input.hotelCode, DEFAULT_HEADERS);
			},
		},
		{
			name: 'get_hotel_room_types',
			title: 'Get Hotel Room Types',
			description:
				'Returns room types available at a specific hotel. Use this after listing hotels to get more details about available rooms. Supports pagination and filtering by room type.',
			inputSchema: z.object({
				hotelCode: z.string().describe('The unique hotel code identifier (e.g. "HOTEL1", "LONPK")'),
				roomType: z.string().optional().describe('Filter by specific room type code'),
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
		{
			name: 'compare_room_prices',
			title: 'Compare Room Prices',
			description:
				'Fetches the price of a single room type at a hotel so you can COMPARE rates across different rooms or hotels. Use this tool when the user is still exploring options and has NOT yet decided which room to book. You may call it multiple times (once per room type). This tool is strictly for information gathering — it does NOT lead to a booking. NEVER use this tool when the user has already chosen a room and wants to proceed with booking — use get_room_pricing instead.',
			inputSchema: z.object({
				hotelCode: z.string().describe('The unique hotel code identifier (e.g. "HOTEL1", "LONPK")'),
				arrivalDate: z.string().describe('Check-in date in YYYY-MM-DD format'),
				departureDate: z.string().describe('Check-out date in YYYY-MM-DD format'),
				adults: z.number().int().min(1).describe('Number of adult guests'),
				children: z.number().int().min(0).optional().describe('Number of child guests'),
				roomType: z.string().optional().describe('Room type code to get pricing for'),
				ratePlanCode: z
					.string()
					.optional()
					.describe(
						'Rate plan code to get pricing for. Do not use unless the user explicitly asks for a specific rate plan.',
					),
			}),
			execute: async (input) => {
				return hotelShopService.getPropertyOffer(
					{
						hotelCode: input.hotelCode,
						arrivalDate: input.arrivalDate,
						departureDate: input.departureDate,
						adults: input.adults,
						children: input.children ?? 0,
						roomType: input.roomType,
						ratePlanCode: input.ratePlanCode,
					},
					DEFAULT_SHOP_HEADERS,
				);
			},
		},
		{
			name: 'get_room_pricing',
			title: 'Get Room Pricing',
			description:
				'Fetches the final price for a specific room the user has CHOSEN and is ready to book. This tool displays a detailed pricing card with a "Confirm Booking" button in the UI. ONLY call this tool when: (1) the user has already decided on a specific room, AND (2) you are about to ask for their final confirmation before creating the reservation. NEVER use this tool for price comparisons or exploration — use compare_room_prices for that. Call this tool exactly ONCE with the chosen room right before asking the user to confirm.',
			inputSchema: z.object({
				hotelCode: z.string().describe('The unique hotel code identifier (e.g. "HOTEL1", "LONPK")'),
				arrivalDate: z.string().describe('Check-in date in YYYY-MM-DD format'),
				departureDate: z.string().describe('Check-out date in YYYY-MM-DD format'),
				adults: z.number().int().min(1).describe('Number of adult guests'),
				children: z.number().int().min(0).optional().describe('Number of child guests'),
				roomType: z.string().optional().describe('Room type code to get pricing for'),
				ratePlanCode: z
					.string()
					.optional()
					.describe(
						'Rate plan code to get pricing for. Do not use unless the user explicitly asks for a specific rate plan.',
					),
			}),
			execute: async (input) => {
				return hotelShopService.getPropertyOffer(
					{
						hotelCode: input.hotelCode,
						arrivalDate: input.arrivalDate,
						departureDate: input.departureDate,
						adults: input.adults,
						children: input.children ?? 0,
						roomType: input.roomType,
						ratePlanCode: input.ratePlanCode,
					},
					DEFAULT_SHOP_HEADERS,
				);
			},
		},
		{
			name: 'create_reservation',
			title: 'Create Hotel Reservation',
			description:
				'Creates a new hotel reservation. IMPORTANT PREREQUISITES: (1) You MUST have already called get_room_pricing (not compare_room_prices) for the chosen room so the user can see the final pricing card. (2) You MUST wait for the user to explicitly confirm (say "yes" or click "Confirm Booking") BEFORE calling this tool. NEVER call create_reservation without first calling get_room_pricing for the same room. NEVER skip get_room_pricing even if you already called compare_room_prices. CRITICAL: Call this tool EXACTLY ONCE per user confirmation. Whether it succeeds or fails, do NOT call it again in the same turn — always stop after this tool and report the result to the user.',
			inputSchema: z.object({
				hotelId: z
					.string()
					.describe(
						'The hotel code/ID where the reservation will be made (e.g. "HOTEL1", "LONPK")',
					),
				arrivalDate: z.string().describe('Check-in date in YYYY-MM-DD format'),
				departureDate: z.string().describe('Check-out date in YYYY-MM-DD format'),
				roomType: z.string().describe('Room type code (e.g. "KING", "DOUBLE", "SUITE")'),
				ratePlanCode: z.string().describe('Rate plan code (e.g. "BAR", "RACK", "CORP")'),
				guests: z
					.array(
						z
							.object({
								// Accept both camelCase and hotel-jargon naming for robustness
								firstName: z.string().optional().describe('Guest first name'),
								givenName: z.string().optional().describe('Guest first name (alias)'),
								lastName: z.string().optional().describe('Guest last name'),
								surname: z.string().optional().describe('Guest last name (alias)'),
								adult: z.boolean().optional().default(true).describe('Is this guest an adult?'),
							})
							.transform((g) => ({
								firstName: g.firstName ?? g.givenName ?? '',
								lastName: g.lastName ?? g.surname ?? '',
								adult: g.adult ?? true,
							})),
					)
					.min(1)
					.describe('List of guests. The first entry is treated as the primary guest.'),
				email: z.string().describe('Guest email address'),
				phone: z.string().describe('Guest phone number'),
				guaranteeType: z
					.string()
					.optional()
					.describe(
						'Guarantee type (e.g. "CC" for credit card, "COMPANY", "PREPAY"). Defaults to CC. Do not ask for this and do not use unless the user explicitly specifies a guarantee type.',
					),
			}),
			execute: async (input) => {
				// Build as 'any' first since the mock API accepts a broader shape than
				// the strict shared types (e.g. guestCounts as object, guaranteeCode field name)
				type NormGuest = { firstName: string; lastName: string; adult: boolean };
				const numberOfChildren = (input.guests as NormGuest[]).filter((g) => !g.adult).length;
				const request: any = {
					reservations: {
						reservation: [
							{
								hotelId: input.hotelId,
								roomStay: {
									arrivalDate: input.arrivalDate,
									departureDate: input.departureDate,
									roomType: input.roomType,
									ratePlanCode: input.ratePlanCode,
									guestCounts: {
										adults: input.guests.length - numberOfChildren,
										children: numberOfChildren,
									},
									guarantee: {
										guaranteeCode: input.guaranteeType ?? 'CC',
									},
								},
								reservationGuests: (input.guests as NormGuest[]).map((guest, idx: number) => ({
									primary: idx === 0,
									profileInfo: {
										profile: {
											customer: {
												personName: [
													{
														givenName: guest.firstName,
														surname: guest.lastName,
													},
												],
											},
											email: input.email,
											phoneNumber: input.phone,
										},
									},
								})),
							},
						],
					},
				};

				return hotelReservationsService.createReservation(
					input.hotelId,
					request,
					DEFAULT_RESERVATIONS_HEADERS,
				);
			},
		},
		{
			name: 'search_reservations',
			title: 'Search Reservations',
			description:
				'Searches for existing hotel reservations by guest name, confirmation number, or date range. Use this to look up existing reservations.',
			inputSchema: z.object({
				hotelId: z.string().describe('The hotel code/ID to search reservations in'),
				surname: z.string().optional().describe('Guest last name to search for'),
				givenName: z.string().optional().describe('Guest first name to search for'),
				arrivalDate: z.string().optional().describe('Filter by arrival date (YYYY-MM-DD)'),
				departureDate: z.string().optional().describe('Filter by departure date (YYYY-MM-DD)'),
			}),
			execute: async (input) => {
				return hotelReservationsService.getHotelReservations(
					input.hotelId,
					{
						surname: input.surname,
						givenName: input.givenName,
						arrivalStartDate: input.arrivalDate,
						arrivalEndDate: input.departureDate,
					},
					DEFAULT_RESERVATIONS_HEADERS,
				);
			},
		},
	];
}
