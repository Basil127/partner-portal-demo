import type {
	HotelInventoryRequestHeaders,
	InventoryStatisticsQuery,
	InventoryStatisticsResponse,
} from '@partner-portal/shared';
import { createClient } from '../external-client/client/index.js';
import { getInventoryStatisticsApiInvV1HotelsHotelIdInventoryStatisticsGet } from '../external-client/sdk.gen.js';
import { zGetInventoryStatisticsApiInvV1HotelsHotelIdInventoryStatisticsGetResponse } from '../external-client/zod.gen.js';
import { config } from '../../../config/config.js';

const externalClient = createClient({
	baseUrl: config.externalClient.baseUrl,
	responseStyle: 'data',
	throwOnError: true,
});

/**
 * Builds the required headers for external inventory API calls.
 */
const buildHeaders = (headers: HotelInventoryRequestHeaders): Record<string, string> => {
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

/**
 * Fetches inventory statistics for a hotel from the external provider.
 *
 * @param query - The query parameters including hotelId, date range, and report code.
 * @param headers - Request headers for authentication and tracing.
 * @returns Promise resolving to the inventory statistics response.
 */
export const fetchInventoryStatistics = async (
	query: InventoryStatisticsQuery,
	headers: HotelInventoryRequestHeaders,
): Promise<InventoryStatisticsResponse> => {
	const response = await getInventoryStatisticsApiInvV1HotelsHotelIdInventoryStatisticsGet({
		client: externalClient,
		throwOnError: true,
		responseStyle: 'data',
		path: {
			hotelId: query.hotelId,
		},
		query: {
			dateRangeStart: query.dateRangeStart,
			dateRangeEnd: query.dateRangeEnd,
			reportCode: query.reportCode,
			parameterName: query.parameterName ?? undefined,
			parameterValue: query.parameterValue ?? undefined,
		},
		headers: buildHeaders(headers) as any,
		responseValidator: async (data) => {
			zGetInventoryStatisticsApiInvV1HotelsHotelIdInventoryStatisticsGetResponse.parse(data);
		},
	});

	return response as unknown as InventoryStatisticsResponse;
};
