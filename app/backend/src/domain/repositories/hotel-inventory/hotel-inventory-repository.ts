import type {
	HotelInventoryRequestHeaders,
	InventoryStatisticsQuery,
	InventoryStatisticsResponse,
} from '@partner-portal/shared';

/**
 * Repository interface for hotel inventory operations.
 * Follows hexagonal architecture for separation of concerns.
 */
export interface HotelInventoryRepository {
	/**
	 * Retrieves inventory statistics for a hotel.
	 *
	 * @param query - Query parameters including hotel ID, date range, and report code.
	 * @param headers - Request headers for authentication and tracing.
	 * @returns Promise resolving to the inventory statistics response.
	 */
	getInventoryStatistics(
		query: InventoryStatisticsQuery,
		headers: HotelInventoryRequestHeaders,
	): Promise<InventoryStatisticsResponse>;
}
