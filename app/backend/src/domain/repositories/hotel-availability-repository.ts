import type {
	HotelAvailabilityRequestHeaders,
	HotelAvailabilitySearchQuery,
	PropertySearchResponse,
} from '@partner-portal/shared';

export interface HotelAvailabilityRepository {
	getAvailableHotels(
		query: HotelAvailabilitySearchQuery,
		headers: HotelAvailabilityRequestHeaders,
	): Promise<PropertySearchResponse>;
}
