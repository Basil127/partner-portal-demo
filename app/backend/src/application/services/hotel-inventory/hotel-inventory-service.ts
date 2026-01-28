import type {
	HotelInventoryRequestHeaders,
	InventoryStatisticsQuery,
	InventoryStatisticsResponse,
} from '@partner-portal/shared';
import type { HotelInventoryRepository } from '../../../domain/repositories/hotel-inventory/hotel-inventory-repository.js';

/**
 * Service layer for hotel inventory operations.
 * Orchestrates business logic and delegates data access to the repository.
 */
export class HotelInventoryService {
	constructor(private hotelInventoryRepository: HotelInventoryRepository) {}

	/**
	 * Retrieves inventory statistics for a hotel.
	 *
	 * @param query - Query parameters for the statistics request.
	 * @param headers - Request headers for authentication and tracing.
	 * @returns Promise resolving to the inventory statistics response.
	 */
	getInventoryStatistics(
		query: InventoryStatisticsQuery,
		headers: HotelInventoryRequestHeaders,
	): Promise<InventoryStatisticsResponse> {
		return this.hotelInventoryRepository.getInventoryStatistics(query, headers);
	}
}
