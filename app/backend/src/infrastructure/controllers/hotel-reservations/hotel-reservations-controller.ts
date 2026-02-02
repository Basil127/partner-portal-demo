import type { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import type {
	CancelReservationRequest,
	CreateReservationRequest,
	HotelReservationsRequestHeaders,
} from '@partner-portal/shared';
import { HotelReservationsService } from '../../../application/services/hotel-reservations/hotel-reservations-service.js';

// Zod schemas for request validation
const UniqueIdSchema = z.object({
	id: z.string().optional().nullable(),
	type: z.string().optional().nullable(),
});

const PersonNameSchema = z.object({
	givenName: z.string().optional().nullable(),
	surname: z.string().optional().nullable(),
	namePrefix: z.string().optional().nullable(),
	middleName: z.string().optional().nullable(),
	nameSuffix: z.string().optional().nullable(),
});

const ProfileSchema = z.object({
	customer: z
		.object({
			personName: z.array(PersonNameSchema).optional().nullable(),
		})
		.optional()
		.nullable(),
	email: z.string().email().optional().nullable(),
	phoneNumber: z.string().optional().nullable(),
	address: z
		.object({
			addressLine: z.array(z.string()).optional().nullable(),
			city: z.string().optional().nullable(),
			postalCode: z.string().optional().nullable(),
			countryCode: z.string().optional().nullable(),
			state: z.string().optional().nullable(),
		})
		.optional()
		.nullable(),
});

const ProfileInfoSchema = z.object({
	profileIdList: z.array(UniqueIdSchema).optional().nullable(),
	profile: ProfileSchema.optional().nullable(),
});

const ReservationGuestSchema = z.object({
	profileInfo: ProfileInfoSchema.optional().nullable(),
	primary: z.boolean().optional().nullable().default(true),
});

const GuestCountsSchema = z.object({
	adults: z.number().int().min(1).optional().nullable(),
	children: z.number().int().min(0).optional().nullable(),
	childrenAges: z.array(z.number().int()).optional().nullable(),
});

const RateTotalSchema = z.object({
	amountBeforeTax: z.number().optional().nullable(),
	amountAfterTax: z.number().optional().nullable(),
	currencyCode: z.string().optional().nullable(),
});

const RateSchema = z.object({
	base: z.number().optional().nullable(),
	amountBeforeTax: z.number().optional().nullable(),
	amountAfterTax: z.number().optional().nullable(),
	currencyCode: z.string().optional().nullable(),
	effectiveDate: z.string().optional().nullable(),
});

const RatesByDateSchema = z.object({
	rate: z.array(RateSchema).optional().nullable(),
});

const GuaranteeSchema = z.object({
	guaranteeCode: z.string().optional().nullable(),
	shortDescription: z.string().optional().nullable(),
	paymentCard: z
		.object({
			cardType: z.string().optional().nullable(),
			cardNumber: z.string().optional().nullable(),
			expireDate: z.string().optional().nullable(),
			cardHolderName: z.string().optional().nullable(),
		})
		.optional()
		.nullable(),
});

const RoomRateSchema = z.object({
	total: RateTotalSchema.optional().nullable(),
	rates: RatesByDateSchema.optional().nullable(),
	roomType: z.string().optional().nullable(),
	ratePlanCode: z.string().optional().nullable(),
	start: z.string().optional().nullable(),
	end: z.string().optional().nullable(),
	guestCounts: GuestCountsSchema.optional().nullable(),
});

const RoomStaySchema = z.object({
	arrivalDate: z.string().optional().nullable(),
	departureDate: z.string().optional().nullable(),
	guarantee: GuaranteeSchema.optional().nullable(),
	roomRates: z.array(RoomRateSchema).optional().nullable(),
	guestCounts: GuestCountsSchema.optional().nullable(),
	roomType: z.string().optional().nullable(),
	ratePlanCode: z.string().optional().nullable(),
	marketCode: z.string().optional().nullable(),
	sourceCode: z.string().optional().nullable(),
	total: RateTotalSchema.optional().nullable(),
});

const ReservationSchema = z.object({
	reservationIdList: z.array(UniqueIdSchema).optional().nullable(),
	roomStay: RoomStaySchema.optional().nullable(),
	reservationGuests: z.array(ReservationGuestSchema).optional().nullable(),
	hotelId: z.string().optional().nullable(),
	reservationStatus: z.string().optional().nullable(),
	createDateTime: z.string().optional().nullable(),
});

const ReservationCollectionSchema = z.object({
	reservation: z.array(ReservationSchema).optional().nullable(),
});

const CreateReservationRequestSchema = z.object({
	reservations: ReservationCollectionSchema,
});

const CancelReservationRequestSchema = z.object({
	reason: z
		.object({
			description: z.string().optional().nullable(),
			code: z.string().optional().nullable(),
		})
		.optional()
		.nullable(),
	reservations: z.array(z.record(z.any())).optional().nullable(),
});

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

		// Validate request body with Zod
		const body = CreateReservationRequestSchema.parse(request.body);

		const result = await this.hotelReservationsService.createReservation(
			hotelId,
			body as CreateReservationRequest,
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

		// Validate request body with Zod
		const body = CreateReservationRequestSchema.parse(request.body);

		const result = await this.hotelReservationsService.updateReservation(
			hotelId,
			reservationId,
			body as CreateReservationRequest,
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

		// Validate request body with Zod
		const body = CancelReservationRequestSchema.parse(request.body);

		const result = await this.hotelReservationsService.cancelReservation(
			hotelId,
			reservationId,
			body as CancelReservationRequest,
			headers,
		);
		return reply.send(result);
	}
}
