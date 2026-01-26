import type {
	HotelAvailabilityRequestHeaders,
	HotelAvailabilitySearchQuery,
	HotelPropertyOfferQuery,
	HotelPropertyOffersSearchQuery,
	HotelShopRequestHeaders,
	OfferDetailsResponse,
	PropertyOffersResponse,
	PropertySearchResponse,
} from '@partner-portal/shared';
import { createClient } from '../external-client/client/index.js';
import {
	zGetPropertiesApiShopV1HotelsGetResponse,
	zGetPropertyOfferApiShopV1HotelsHotelCodeOfferGetResponse,
	zGetPropertyOffersApiShopV1HotelsHotelCodeOffersGetResponse,
} from '../external-client/zod.gen.js';
import { config } from '../../../config/config.js';

const externalClient = createClient({
	baseUrl: config.externalClient.baseUrl,
	responseStyle: 'data',
	throwOnError: true,
});

const buildHeaders = (
	headers: HotelAvailabilityRequestHeaders | HotelShopRequestHeaders,
): Record<string, string> => {
	const outgoing: Record<string, string> = {
		'x-channelCode': headers.channelCode,
	};

	if (headers.authorization) {
		outgoing.authorization = headers.authorization;
	}
	if (headers.appKey) {
		outgoing['x-app-key'] = headers.appKey;
	}
	if (headers.acceptLanguage) {
		outgoing['Accept-Language'] = headers.acceptLanguage;
	}
	if (headers.requestId) {
		outgoing['x-request-id'] = headers.requestId;
	}
	if (headers.originatingApplication) {
		outgoing['x-originating-application'] = headers.originatingApplication;
	}
	if ('externalSystem' in headers && headers.externalSystem) {
		outgoing['x-externalsystem'] = headers.externalSystem;
	}

	return outgoing;
};

export const fetchHotelAvailability = async (
	query: HotelAvailabilitySearchQuery,
	headers: HotelAvailabilityRequestHeaders,
): Promise<PropertySearchResponse> => {
	const response = await externalClient.request<PropertySearchResponse, unknown, true, 'data'>({
		method: 'GET',
		url: '/api/shop/v1/hotels',
		responseStyle: 'data',
		throwOnError: true,
		query: {
			HotelCodes: query.hotelCodes,
			ArrivalDate: query.arrivalDate,
			ArrivalDateTo: query.arrivalDateTo ?? undefined,
			DepartureDate: query.departureDate,
			Adults: query.adults ?? undefined,
			Children: query.children ?? undefined,
			ChildrenAges: query.childrenAges ?? undefined,
			RatePlanCodes: query.ratePlanCodes ?? undefined,
			AccessCode: query.accessCode ?? undefined,
			NumberOfUnits: query.numberOfUnits ?? undefined,
			RateMode: query.rateMode ?? undefined,
			RatePlanCodeMatchOnly: query.ratePlanCodeMatchOnly ?? undefined,
			RatePlanType: query.ratePlanType ?? undefined,
			AvailableOnly: query.availableOnly ?? undefined,
			minRate: query.minRate ?? undefined,
			maxRate: query.maxRate ?? undefined,
			AlternateOffers: query.alternateOffers ?? undefined,
			CommissionableStatus: query.commissionableStatus ?? undefined,
			PromotionCodes: query.promotionCodes ?? undefined,
		},
		headers: buildHeaders(headers),
		responseValidator: async (data) => {
			zGetPropertiesApiShopV1HotelsGetResponse.parse(data);
		},
	});

	return response;
};

export const fetchPropertyOffers = async (
	query: HotelPropertyOffersSearchQuery,
	headers: HotelShopRequestHeaders,
): Promise<PropertyOffersResponse> => {
	const response = await externalClient.request<PropertyOffersResponse, unknown, true, 'data'>({
		method: 'GET',
		url: `/api/shop/v1/hotels/${query.hotelCode}/offers`,
		responseStyle: 'data',
		throwOnError: true,
		query: {
			ArrivalDate: query.arrivalDate,
			DepartureDate: query.departureDate,
			Adults: query.adults ?? undefined,
			Children: query.children ?? undefined,
			ChildrenAges: query.childrenAges ?? undefined,
			RoomTypes: query.roomTypes ?? undefined,
			RatePlanCodes: query.ratePlanCodes ?? undefined,
			AccessCode: query.accessCode ?? undefined,
			RatePlanType: query.ratePlanType ?? undefined,
			NumberOfUnits: query.numberOfUnits ?? undefined,
			RoomTypeMatchOnly: query.roomTypeMatchOnly ?? undefined,
			RatePlanCodeMatchOnly: query.ratePlanCodeMatchOnly ?? undefined,
			RateMode: query.rateMode ?? undefined,
			RoomAmenity: query.roomAmenity ?? undefined,
			RoomAmenityQuantity: query.roomAmenityQuantity ?? undefined,
			IncludeAmenities: query.includeAmenities ?? undefined,
			minRate: query.minRate ?? undefined,
			maxRate: query.maxRate ?? undefined,
			AlternateOffers: query.alternateOffers ?? undefined,
			CommissionableStatus: query.commissionableStatus ?? undefined,
			PromotionCodes: query.promotionCodes ?? undefined,
			BlockCode: query.blockCode ?? undefined,
		},
		headers: buildHeaders(headers),
		responseValidator: async (data) => {
			zGetPropertyOffersApiShopV1HotelsHotelCodeOffersGetResponse.parse(data);
		},
	});

	return response;
};

export const fetchPropertyOffer = async (
	query: HotelPropertyOfferQuery,
	headers: HotelShopRequestHeaders,
): Promise<OfferDetailsResponse> => {
	const response = await externalClient.request<OfferDetailsResponse, unknown, true, 'data'>({
		method: 'GET',
		url: `/api/shop/v1/hotels/${query.hotelCode}/offer`,
		responseStyle: 'data',
		throwOnError: true,
		query: {
			ArrivalDate: query.arrivalDate,
			DepartureDate: query.departureDate,
			Adults: query.adults ?? undefined,
			Children: query.children ?? undefined,
			ChildrenAges: query.childrenAges ?? undefined,
			RoomType: query.roomType ?? undefined,
			RatePlanCode: query.ratePlanCode ?? undefined,
			AccessCode: query.accessCode ?? undefined,
			RateMode: query.rateMode ?? undefined,
			NumberOfUnits: query.numberOfUnits ?? undefined,
			BookingCode: query.bookingCode ?? undefined,
			IncludeAmenities: query.includeAmenities ?? undefined,
			PromotionCodes: query.promotionCodes ?? undefined,
			BlockCode: query.blockCode ?? undefined,
		},
		headers: buildHeaders(headers),
		responseValidator: async (data) => {
			zGetPropertyOfferApiShopV1HotelsHotelCodeOfferGetResponse.parse(data);
		},
	});

	return response;
};
