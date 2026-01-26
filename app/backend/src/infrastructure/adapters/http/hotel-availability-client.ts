import type {
	HotelAvailabilityRequestHeaders,
	HotelAvailabilitySearchQuery,
	PropertySearchResponse,
} from '@partner-portal/shared';
import { createClient } from './external-client/client/index.js';
import { zGetPropertiesApiShopV1HotelsGetResponse } from './external-client/zod.gen.js';
import { config } from '../../config/config.js';

const externalClient = createClient({
	baseUrl: config.externalClient.baseUrl,
	responseStyle: 'data',
	throwOnError: true,
});

const buildHeaders = (headers: HotelAvailabilityRequestHeaders): Record<string, string> => {
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

	return outgoing;
};

export const fetchHotelAvailability = async (
	query: HotelAvailabilitySearchQuery,
	headers: HotelAvailabilityRequestHeaders,
): Promise<PropertySearchResponse> => {
	const response = await externalClient.request<PropertySearchResponse, unknown, true, 'data'>(
		{
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
		},
	);

	return response;
};
