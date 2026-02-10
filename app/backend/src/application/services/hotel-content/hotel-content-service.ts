import type {
	HotelContentRequestHeaders,
	PropertiesSummaryQuery,
	PropertyInfoResponse,
	PropertyInfoSummaryResponse,
	RoomTypesQuery,
	RoomTypesResponse,
} from '@partner-portal/shared';
import type { HotelContentRepository } from '../../../domain/repositories/hotel-content/hotel-content-repository.js';

export class HotelContentService {
	constructor(private hotelContentRepository: HotelContentRepository) {}

	getPropertiesSummary(
		query: PropertiesSummaryQuery,
		headers: HotelContentRequestHeaders,
	): Promise<PropertyInfoSummaryResponse> {
		return this.hotelContentRepository.getPropertiesSummary(query, headers);
	}

	getPropertyInfo(
		hotelCode: string,
		headers: HotelContentRequestHeaders,
	): Promise<PropertyInfoResponse> {
		return this.hotelContentRepository.getPropertyInfo(hotelCode, headers);
	}

	getRoomTypes(
		hotelCode: string,
		query: RoomTypesQuery,
		headers: HotelContentRequestHeaders,
	): Promise<RoomTypesResponse> {
		return this.hotelContentRepository.getRoomTypes(hotelCode, query, headers);
	}
}
