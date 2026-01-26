import type {
	HotelAvailabilityRequestHeaders,
	HotelAvailabilitySearchQuery,
	PropertySearchResponse,
} from '@partner-portal/shared';
import type { HotelAvailabilityRepository } from '../../domain/repositories/hotel-availability-repository.js';

export class HotelAvailabilityService {
	constructor(private hotelAvailabilityRepository: HotelAvailabilityRepository) {}

	async getAvailableHotels(
		query: HotelAvailabilitySearchQuery,
		headers: HotelAvailabilityRequestHeaders,
	): Promise<PropertySearchResponse> {
		return this.hotelAvailabilityRepository.getAvailableHotels(query, headers);
	}
}
