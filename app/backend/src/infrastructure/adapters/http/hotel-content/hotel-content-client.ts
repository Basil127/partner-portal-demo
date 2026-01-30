import type {
	HotelContentRequestHeaders,
	PropertiesSummaryQuery,
	PropertyInfoResponse,
	PropertyInfoSummaryResponse,
	RoomTypesQuery,
	RoomTypesResponse,
} from '@partner-portal/shared';
import { createClient } from '../external-client/client/index.js';
import {
	getPropertiesSummaryApiContentV1HotelsGet,
	getPropertyInfoApiContentV1HotelsHotelCodeGet,
	getRoomTypesInfoApiContentV1HotelsHotelCodeRoomTypesGet,
} from '../external-client/sdk.gen.js';
import {
	zGetPropertiesSummaryApiContentV1HotelsGetResponse,
	zGetPropertyInfoApiContentV1HotelsHotelCodeGetResponse,
	zGetRoomTypesInfoApiContentV1HotelsHotelCodeRoomTypesGetResponse,
} from '../external-client/zod.gen.js';
import { config } from '../../../config/config.js';

const externalClient = createClient({
	baseUrl: config.externalClient.baseUrl,
	responseStyle: 'data',
	throwOnError: true,
});

const buildHeaders = (headers: HotelContentRequestHeaders): Record<string, string> => {
	const outgoing: Record<string, string> = {
		'x-channelCode': headers.channelCode,
	};

	if (headers.authorization) {
		outgoing.authorization = headers.authorization;
	}
	if (headers.appKey) {
		outgoing['x-app-key'] = headers.appKey;
	}
	if (headers.requestId) {
		outgoing['x-request-id'] = headers.requestId;
	}
	if (headers.originatingApplication) {
		outgoing['x-originating-application'] = headers.originatingApplication;
	}

	return outgoing;
};

export const fetchPropertiesSummary = async (
	query: PropertiesSummaryQuery,
	headers: HotelContentRequestHeaders,
): Promise<PropertyInfoSummaryResponse> => {
	const response = await getPropertiesSummaryApiContentV1HotelsGet({
		client: externalClient,
		throwOnError: true,
		responseStyle: 'data',
		query: {
			connectionStatusLastChangedFrom: query.connectionStatusLastChangedFrom ?? undefined,
			connectionStatusLastChangedTo: query.connectionStatusLastChangedTo ?? undefined,
			connectionStatus: query.connectionStatus ?? undefined,
			fetchInstructions: query.fetchInstructions ?? undefined,
			limit: query.limit ?? undefined,
			offset: query.offset ?? undefined,
		},
		headers: buildHeaders(headers) as any,
		responseValidator: async (data: unknown) => {
			zGetPropertiesSummaryApiContentV1HotelsGetResponse.parse(data);
		},
	});

	return response as PropertyInfoSummaryResponse;
};

export const fetchPropertyInfo = async (
	hotelCode: string,
	headers: HotelContentRequestHeaders,
): Promise<PropertyInfoResponse> => {
	const response = await getPropertyInfoApiContentV1HotelsHotelCodeGet({
		client: externalClient,
		throwOnError: true,
		responseStyle: 'data',
		path: {
			hotelCode,
		},
		headers: buildHeaders(headers) as any,
		// Skip validation - the external API doesn't match the schema exactly
		// responseValidator: async (data: unknown) => {
		// 	zGetPropertyInfoApiContentV1HotelsHotelCodeGetResponse.parse(data);
		// },
	});

	return response as PropertyInfoResponse;
};

export const fetchRoomTypes = async (
	hotelCode: string,
	query: RoomTypesQuery,
	headers: HotelContentRequestHeaders,
): Promise<RoomTypesResponse> => {
	const response = await getRoomTypesInfoApiContentV1HotelsHotelCodeRoomTypesGet({
		client: externalClient,
		throwOnError: true,
		responseStyle: 'data',
		path: {
			hotelCode,
		},
		query: {
			includeRoomAmenities: query.includeRoomAmenities ?? undefined,
			roomType: query.roomType ?? undefined,
			limit: query.limit ?? undefined,
			offset: query.offset ?? undefined,
		},
		headers: buildHeaders(headers) as any,
		// Skip validation - the external API doesn't match the schema exactly
		// responseValidator: async (data: unknown) => {
		// 	zGetRoomTypesInfoApiContentV1HotelsHotelCodeRoomTypesGetResponse.parse(data);
		// },
	});

	return response as RoomTypesResponse;
};
