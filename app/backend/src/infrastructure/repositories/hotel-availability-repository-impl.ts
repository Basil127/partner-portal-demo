import type {
	HotelAvailabilityRequestHeaders,
	HotelAvailabilitySearchQuery,
	PropertySearchResponse,
} from '@partner-portal/shared';
import type { HotelAvailabilityRepository } from '../../domain/repositories/hotel-availability-repository.js';
import { fetchHotelAvailability } from '../adapters/http/hotel-availability-client.js';

export class HotelAvailabilityRepositoryImpl implements HotelAvailabilityRepository {
	async getAvailableHotels(
		query: HotelAvailabilitySearchQuery,
		headers: HotelAvailabilityRequestHeaders,
	): Promise<PropertySearchResponse> {
		return fetchHotelAvailability(query, headers);
	}
}
