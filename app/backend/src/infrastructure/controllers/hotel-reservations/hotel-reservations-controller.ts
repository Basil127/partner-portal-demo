import type { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import type {
	CancelReservationRequest,
	CreateReservationRequest,
	HotelReservationsRequestHeaders,
} from '@partner-portal/shared';
import { HotelReservationsService } from '../../../application/services/hotel-reservations/hotel-reservations-service.js';

const GetHotelReservationsQuerySchema = z.object({
	surname: z.string().optional(),
	givenName: z.string().optional(),
	arrivalStartDate: z.string().optional(),
	arrivalEndDate: z.string().optional(),
	confirmationNumberList: z
		.union([z.string(), z.array(z.string())])
		.transform((val) => (Array.isArray(val) ? val : [val]))
		.optional(),
	limit: z.coerce.number().int().optional(),
	offset: z.coerce.number().int().optional(),
});

const GetReservationsSummaryQuerySchema = z.object({
	arrivalDate: z.string().optional(),
	lastName: z.string().optional(),
	limit: z.coerce.number().int().optional(),
	offset: z.coerce.number().int().optional(),
});

const GetReservationStatisticsQuerySchema = z.object({
	startDate: z.string().optional(),
	endDate: z.string().optional(),
	limit: z.coerce.number().int().optional(),
	offset: z.coerce.number().int().optional(),
});

const HeaderSchema = z.object({
	authorization: z.string().optional(),
	'x-channelcode': z.string().optional(),
	'x-app-key': z.string().optional(),
	'x-request-id': z.string().optional(),
	'x-originating-application': z.string().optional(),
});

export class HotelReservationsController {
	constructor(private hotelReservationsService: HotelReservationsService) {}

	private buildHeaders(request: FastifyRequest): HotelReservationsRequestHeaders {
		const headers = HeaderSchema.parse(request.headers);
		return {
			channelCode: headers['x-channelcode'] || 'OPERA',
			authorization: headers.authorization,
			appKey: headers['x-app-key'],
			requestId: headers['x-request-id'],
			originatingApplication: headers['x-originating-application'],
		};
	}

	async getHotelReservations(
		request: FastifyRequest<{ Params: { hotelId: string }; Querystring: any }>,
		reply: FastifyReply,
	) {
		const { hotelId } = request.params;
		const query = GetHotelReservationsQuerySchema.parse(request.query);
		const headers = this.buildHeaders(request);
		const result = await this.hotelReservationsService.getHotelReservations(
			hotelId,
			query,
			headers,
		);
		return reply.send(result);
	}

	async createReservation(
		request: FastifyRequest<{ Params: { hotelId: string }; Body: any }>,
		reply: FastifyReply,
	) {
		const { hotelId } = request.params;
		const headers = this.buildHeaders(request);
		const result = await this.hotelReservationsService.createReservation(
			hotelId,
			request.body as CreateReservationRequest,
			headers,
		);
		return reply.send(result);
	}

	async getReservationsSummary(
		request: FastifyRequest<{ Params: { hotelId: string }; Querystring: any }>,
		reply: FastifyReply,
	) {
		const { hotelId } = request.params;
		const query = GetReservationsSummaryQuerySchema.parse(request.query);
		const headers = this.buildHeaders(request);
		const result = await this.hotelReservationsService.getReservationsSummary(
			hotelId,
			query,
			headers,
		);
		return reply.send(result);
	}

	async getReservationStatistics(
		request: FastifyRequest<{ Params: { hotelId: string }; Querystring: any }>,
		reply: FastifyReply,
	) {
		const { hotelId } = request.params;
		const query = GetReservationStatisticsQuerySchema.parse(request.query);
		const headers = this.buildHeaders(request);
		const result = await this.hotelReservationsService.getReservationStatistics(
			hotelId,
			query,
			headers,
		);
		reply.send(result);
	}

	async updateReservation(
		request: FastifyRequest<{ Params: { hotelId: string; reservationId: string }; Body: any }>,
		reply: FastifyReply,
	) {
		const { hotelId, reservationId } = request.params;
		const headers = this.buildHeaders(request);
		const result = await this.hotelReservationsService.updateReservation(
			hotelId,
			reservationId,
			request.body as CreateReservationRequest,
			headers,
		);
		return reply.send(result);
	}

	async cancelReservation(
		request: FastifyRequest<{ Params: { hotelId: string; reservationId: string }; Body: any }>,
		reply: FastifyReply,
	) {
		const { hotelId, reservationId } = request.params;
		const headers = this.buildHeaders(request);
		const result = await this.hotelReservationsService.cancelReservation(
			hotelId,
			reservationId,
			request.body as CancelReservationRequest,
			headers,
		);
		return reply.send(result);
	}
}
