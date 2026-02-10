import type {
	HotelContentRequestHeaders,
	PropertiesSummaryQuery,
	PropertyInfoResponse,
	PropertyInfoSummaryResponse,
	RoomTypesQuery,
	RoomTypesResponse,
} from '@partner-portal/shared';
import type { HotelContentRepository } from '../../../domain/repositories/hotel-content/hotel-content-repository.js';
import {
	fetchPropertiesSummary,
	fetchPropertyInfo,
	fetchRoomTypes,
} from '../../adapters/http/hotel-content/hotel-content-client.js';

export class HotelContentRepositoryImpl implements HotelContentRepository {
	getPropertiesSummary(
		query: PropertiesSummaryQuery,
		headers: HotelContentRequestHeaders,
	): Promise<PropertyInfoSummaryResponse> {
		return fetchPropertiesSummary(query, headers);
	}

	getPropertyInfo(
		hotelCode: string,
		headers: HotelContentRequestHeaders,
	): Promise<PropertyInfoResponse> {
		return fetchPropertyInfo(hotelCode, headers);
	}

	getRoomTypes(
		hotelCode: string,
		query: RoomTypesQuery,
		headers: HotelContentRequestHeaders,
	): Promise<RoomTypesResponse> {
		return fetchRoomTypes(hotelCode, query, headers);
	}
}
