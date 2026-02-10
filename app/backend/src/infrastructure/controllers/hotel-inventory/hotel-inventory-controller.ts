import type { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import type {
	HotelInventoryRequestHeaders,
	InventoryReportCode,
	InventoryStatisticsQuery,
} from '@partner-portal/shared';
import { HotelInventoryService } from '../../../application/services/hotel-inventory/hotel-inventory-service.js';
import { config } from '../../config/config.js';

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD format');

const InventoryStatisticsQuerySchema = z.object({
	hotelId: z.string().min(1).max(2000),
	dateRangeStart: dateString,
	dateRangeEnd: dateString,
	reportCode: z.enum([
		'DetailedAvailabiltySummary',
		'RoomCalendarStatistics',
		'SellLimitSummary',
		'RoomsAvailabilitySummary',
	]),
	parameterName: z
		.union([z.string().transform((val) => val.split(',')), z.array(z.string())])
		.optional(),
	parameterValue: z
		.union([z.string().transform((val) => val.split(',')), z.array(z.string())])
		.optional(),
});

const HeaderSchema = z.object({
	authorization: z.string().optional(),
	'x-channelcode': z.string().optional(),
	'x-app-key': z.string().optional(),
	'accept-language': z.string().optional(),
	'x-request-id': z.string().optional(),
	'x-originating-application': z.string().optional(),
});

/**
 * Controller for hotel inventory endpoints.
 * Handles HTTP request/response and delegates business logic to the service layer.
 */
export class HotelInventoryController {
	constructor(private hotelInventoryService: HotelInventoryService) {}

	/**
	 * Handles GET request for hotel inventory statistics.
	 * Validates request parameters, builds headers, and calls the service.
	 */
	async getInventoryStatistics(
		request: FastifyRequest<{
			Params: Record<string, string>;
			Querystring: Record<string, string | string[] | undefined>;
		}>,
		reply: FastifyReply,
	) {
		request.log.info(
			{ params: request.params, query: request.query, headers: request.headers },
			'Inventory statistics request received',
		);

		try {
			const query = InventoryStatisticsQuerySchema.parse({
				...request.query,
				hotelId: request.params.hotelId,
			});
			const incomingHeaders = HeaderSchema.parse(request.headers);
			const channelCode =
				incomingHeaders['x-channelcode'] || config.externalClient.channelCode || undefined;

			if (!channelCode) {
				return reply.status(400).send({ error: 'Missing required header: x-channelcode' });
			}

			const headers: HotelInventoryRequestHeaders = {
				channelCode,
				authorization: incomingHeaders.authorization,
				appKey: incomingHeaders['x-app-key'] || config.externalClient.appKey,
				acceptLanguage: incomingHeaders['accept-language'],
				requestId: incomingHeaders['x-request-id'],
				originatingApplication:
					incomingHeaders['x-originating-application'] ||
					config.externalClient.originatingApplication,
			};

			const data: InventoryStatisticsQuery = {
				hotelId: query.hotelId,
				dateRangeStart: query.dateRangeStart,
				dateRangeEnd: query.dateRangeEnd,
				reportCode: query.reportCode as InventoryReportCode,
				parameterName: query.parameterName ?? null,
				parameterValue: query.parameterValue ?? null,
			};

			const response = await this.hotelInventoryService.getInventoryStatistics(data, headers);
			request.log.info({ responseLength: response?.length }, 'Inventory statistics response');
			return reply.send(response);
		} catch (error) {
			request.log.error(error);
			if (error instanceof z.ZodError) {
				const details = error.issues ?? (error as unknown as { errors: unknown }).errors;
				return reply.status(400).send({ error: 'Validation error', details });
			}
			return reply.status(500).send({ error: 'Internal server error' });
		}
	}
}
