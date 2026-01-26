import type { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import type {
	HotelAvailabilityRequestHeaders,
	HotelAvailabilitySearchQuery,
	HotelPropertyOfferQuery,
	HotelPropertyOffersSearchQuery,
	HotelShopRequestHeaders,
} from '@partner-portal/shared';
import { HotelShopService } from '../../../application/services/hotel-shop/hotel-shop-service.js';
import { config } from '../../config/config.js';

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD');
const booleanString = z.preprocess((value) => {
	if (value === 'true') return true;
	if (value === 'false') return false;
	return value;
}, z.boolean());

const HotelAvailabilityQuerySchema = z.object({
	hotelCodes: z.string().min(1),
	arrivalDate: dateString,
	departureDate: dateString,
	arrivalDateTo: dateString.optional(),
	adults: z.coerce.number().int().min(1).optional(),
	children: z.coerce.number().int().min(0).optional(),
	childrenAges: z.string().optional(),
	ratePlanCodes: z.string().optional(),
	accessCode: z.string().optional(),
	numberOfUnits: z.coerce.number().int().min(1).optional(),
	rateMode: z.string().optional(),
	ratePlanCodeMatchOnly: booleanString.optional(),
	ratePlanType: z.string().optional(),
	availableOnly: booleanString.optional(),
	minRate: z.coerce.number().optional(),
	maxRate: z.coerce.number().optional(),
	alternateOffers: z.string().optional(),
	commissionableStatus: z.string().optional(),
	promotionCodes: z.string().optional(),
});

const PropertyOffersQuerySchema = z.object({
	hotelCode: z.string().min(1),
	arrivalDate: dateString,
	departureDate: dateString,
	adults: z.coerce.number().int().min(1).optional(),
	children: z.coerce.number().int().min(0).optional(),
	childrenAges: z.string().optional(),
	roomTypes: z.string().optional(),
	ratePlanCodes: z.string().optional(),
	accessCode: z.string().optional(),
	ratePlanType: z.string().optional(),
	numberOfUnits: z.coerce.number().int().min(1).optional(),
	roomTypeMatchOnly: booleanString.optional(),
	ratePlanCodeMatchOnly: booleanString.optional(),
	rateMode: z.string().optional(),
	roomAmenity: z.string().optional(),
	roomAmenityQuantity: z.coerce.number().int().min(0).optional(),
	includeAmenities: booleanString.optional(),
	minRate: z.coerce.number().optional(),
	maxRate: z.coerce.number().optional(),
	alternateOffers: z.string().optional(),
	commissionableStatus: z.string().optional(),
	promotionCodes: z.string().optional(),
	blockCode: z.string().optional(),
});

const PropertyOfferQuerySchema = z.object({
	hotelCode: z.string().min(1),
	arrivalDate: dateString,
	departureDate: dateString,
	adults: z.coerce.number().int().min(1).optional(),
	children: z.coerce.number().int().min(0).optional(),
	childrenAges: z.string().optional(),
	roomType: z.string().optional(),
	ratePlanCode: z.string().optional(),
	accessCode: z.string().optional(),
	rateMode: z.string().optional(),
	numberOfUnits: z.coerce.number().int().min(1).optional(),
	bookingCode: z.string().optional(),
	includeAmenities: booleanString.optional(),
	promotionCodes: z.string().optional(),
	blockCode: z.string().optional(),
});

const HeaderSchema = z.object({
	authorization: z.string().optional(),
	'x-channelcode': z.string().optional(),
	'x-app-key': z.string().optional(),
	'accept-language': z.string().optional(),
	'x-request-id': z.string().optional(),
	'x-originating-application': z.string().optional(),
	'x-externalsystem': z.string().optional(),
});

export class HotelShopController {
	constructor(private hotelShopService: HotelShopService) {}

	async getAvailableHotels(
		request: FastifyRequest<{ Querystring: Record<string, string | undefined> }>,
		reply: FastifyReply,
	) {
		try {
			const query = HotelAvailabilityQuerySchema.parse(request.query);
			const incomingHeaders = HeaderSchema.parse(request.headers);
			const channelCode =
				incomingHeaders['x-channelcode'] || config.externalClient.channelCode || undefined;

			if (!channelCode) {
				return reply.status(400).send({ error: 'Missing required header: x-channelcode' });
			}

			const headers: HotelAvailabilityRequestHeaders = {
				channelCode,
				authorization: incomingHeaders.authorization,
				appKey: incomingHeaders['x-app-key'] || config.externalClient.appKey,
				acceptLanguage: incomingHeaders['accept-language'],
				requestId: incomingHeaders['x-request-id'],
				originatingApplication:
					incomingHeaders['x-originating-application'] ||
					config.externalClient.originatingApplication,
			};

			const data: HotelAvailabilitySearchQuery = {
				hotelCodes: query.hotelCodes,
				arrivalDate: query.arrivalDate,
				departureDate: query.departureDate,
				arrivalDateTo: query.arrivalDateTo,
				adults: query.adults,
				children: query.children,
				childrenAges: query.childrenAges,
				ratePlanCodes: query.ratePlanCodes,
				accessCode: query.accessCode,
				numberOfUnits: query.numberOfUnits,
				rateMode: query.rateMode,
				ratePlanCodeMatchOnly: query.ratePlanCodeMatchOnly,
				ratePlanType: query.ratePlanType,
				availableOnly: query.availableOnly,
				minRate: query.minRate,
				maxRate: query.maxRate,
				alternateOffers: query.alternateOffers,
				commissionableStatus: query.commissionableStatus,
				promotionCodes: query.promotionCodes,
			};

			const response = await this.hotelShopService.getAvailableHotels(data, headers);
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

	async getPropertyOffers(
		request: FastifyRequest<{
			Params: Record<string, string>;
			Querystring: Record<string, string | undefined>;
		}>,
		reply: FastifyReply,
	) {
		try {
			const query = PropertyOffersQuerySchema.parse({
				...request.query,
				hotelCode: request.params.hotelCode,
			});
			const incomingHeaders = HeaderSchema.parse(request.headers);
			const channelCode =
				incomingHeaders['x-channelcode'] || config.externalClient.channelCode || undefined;

			if (!channelCode) {
				return reply.status(400).send({ error: 'Missing required header: x-channelcode' });
			}

			const headers: HotelShopRequestHeaders = {
				channelCode,
				authorization: incomingHeaders.authorization,
				appKey: incomingHeaders['x-app-key'] || config.externalClient.appKey,
				acceptLanguage: incomingHeaders['accept-language'],
				requestId: incomingHeaders['x-request-id'],
				originatingApplication:
					incomingHeaders['x-originating-application'] ||
					config.externalClient.originatingApplication,
				externalSystem: incomingHeaders['x-externalsystem'] || config.externalClient.externalSystem,
			};

			const data: HotelPropertyOffersSearchQuery = {
				hotelCode: query.hotelCode,
				arrivalDate: query.arrivalDate,
				departureDate: query.departureDate,
				adults: query.adults,
				children: query.children,
				childrenAges: query.childrenAges,
				roomTypes: query.roomTypes,
				ratePlanCodes: query.ratePlanCodes,
				accessCode: query.accessCode,
				ratePlanType: query.ratePlanType,
				numberOfUnits: query.numberOfUnits,
				roomTypeMatchOnly: query.roomTypeMatchOnly,
				ratePlanCodeMatchOnly: query.ratePlanCodeMatchOnly,
				rateMode: query.rateMode,
				roomAmenity: query.roomAmenity,
				roomAmenityQuantity: query.roomAmenityQuantity,
				includeAmenities: query.includeAmenities,
				minRate: query.minRate,
				maxRate: query.maxRate,
				alternateOffers: query.alternateOffers,
				commissionableStatus: query.commissionableStatus,
				promotionCodes: query.promotionCodes,
				blockCode: query.blockCode,
			};

			const response = await this.hotelShopService.getPropertyOffers(data, headers);
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

	async getPropertyOffer(
		request: FastifyRequest<{
			Params: Record<string, string>;
			Querystring: Record<string, string | undefined>;
		}>,
		reply: FastifyReply,
	) {
		try {
			const query = PropertyOfferQuerySchema.parse({
				...request.query,
				hotelCode: request.params.hotelCode,
			});
			const incomingHeaders = HeaderSchema.parse(request.headers);
			const channelCode =
				incomingHeaders['x-channelcode'] || config.externalClient.channelCode || undefined;

			if (!channelCode) {
				return reply.status(400).send({ error: 'Missing required header: x-channelcode' });
			}

			const headers: HotelShopRequestHeaders = {
				channelCode,
				authorization: incomingHeaders.authorization,
				appKey: incomingHeaders['x-app-key'] || config.externalClient.appKey,
				acceptLanguage: incomingHeaders['accept-language'],
				requestId: incomingHeaders['x-request-id'],
				originatingApplication:
					incomingHeaders['x-originating-application'] ||
					config.externalClient.originatingApplication,
				externalSystem: incomingHeaders['x-externalsystem'] || config.externalClient.externalSystem,
			};

			const data: HotelPropertyOfferQuery = {
				hotelCode: query.hotelCode,
				arrivalDate: query.arrivalDate,
				departureDate: query.departureDate,
				adults: query.adults,
				children: query.children,
				childrenAges: query.childrenAges,
				roomType: query.roomType,
				ratePlanCode: query.ratePlanCode,
				accessCode: query.accessCode,
				rateMode: query.rateMode,
				numberOfUnits: query.numberOfUnits,
				bookingCode: query.bookingCode,
				includeAmenities: query.includeAmenities,
				promotionCodes: query.promotionCodes,
				blockCode: query.blockCode,
			};

			const response = await this.hotelShopService.getPropertyOffer(data, headers);
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
