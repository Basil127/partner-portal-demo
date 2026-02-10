import type { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import type { HotelContentRequestHeaders } from '@partner-portal/shared';
import { HotelContentService } from '../../../application/services/hotel-content/hotel-content-service.js';

const booleanString = z.preprocess((value) => {
	if (value === 'true') return true;
	if (value === 'false') return false;
	return value;
}, z.boolean());

const PropertiesSummaryQuerySchema = z.object({
	connectionStatusLastChangedFrom: z.string().optional(),
	connectionStatusLastChangedTo: z.string().optional(),
	connectionStatus: z.string().optional(),
	fetchInstructions: z.string().optional(),
	limit: z.coerce.number().int().min(1).optional(),
	offset: z.coerce.number().int().min(0).optional(),
});

const RoomTypesQuerySchema = z.object({
	includeRoomAmenities: booleanString.optional(),
	roomType: z.string().optional(),
	limit: z.coerce.number().int().min(1).optional(),
	offset: z.coerce.number().int().min(0).optional(),
});

const HeaderSchema = z.object({
	authorization: z.string().optional(),
	'x-channelcode': z.string().optional(),
	'x-app-key': z.string().optional(),
	'x-request-id': z.string().optional(),
	'x-originating-application': z.string().optional(),
});

export class HotelContentController {
	constructor(private hotelContentService: HotelContentService) {}

	private buildHeaders(request: FastifyRequest): HotelContentRequestHeaders {
		const headers = HeaderSchema.parse(request.headers);
		return {
			channelCode: headers['x-channelcode'] || 'OPERA',
			authorization: headers.authorization,
			appKey: headers['x-app-key'] || undefined,
			requestId: headers['x-request-id'],
			originatingApplication: headers['x-originating-application'],
		};
	}

	async getPropertiesSummary(
		request: FastifyRequest<{ Querystring: Record<string, string | undefined> }>,
		reply: FastifyReply,
	) {
		const query = PropertiesSummaryQuerySchema.parse(request.query);
		const headers = this.buildHeaders(request);
		const result = await this.hotelContentService.getPropertiesSummary(query, headers);
		return reply.send(result);
	}

	async getPropertyInfo(
		request: FastifyRequest<{ Params: { hotelCode: string } }>,
		reply: FastifyReply,
	) {
		const { hotelCode } = request.params;
		const headers = this.buildHeaders(request);
		const result = await this.hotelContentService.getPropertyInfo(hotelCode, headers);
		return reply.send(result);
	}

	async getRoomTypes(
		request: FastifyRequest<{
			Params: { hotelCode: string };
			Querystring: Record<string, string | undefined>;
		}>,
		reply: FastifyReply,
	) {
		const { hotelCode } = request.params;
		const query = RoomTypesQuerySchema.parse(request.query);
		const headers = this.buildHeaders(request);
		const result = await this.hotelContentService.getRoomTypes(hotelCode, query, headers);
		return reply.send(result);
	}
}
