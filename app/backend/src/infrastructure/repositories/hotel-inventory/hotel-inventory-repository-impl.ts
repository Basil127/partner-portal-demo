import type {
	HotelInventoryRequestHeaders,
	InventoryStatisticsQuery,
	InventoryStatisticsResponse,
} from '@partner-portal/shared';
import type { HotelInventoryRepository } from '../../../domain/repositories/hotel-inventory/hotel-inventory-repository.js';
import { fetchInventoryStatistics } from '../../adapters/http/hotel-inventory/hotel-inventory-client.js';

/**
 * Implementation of the HotelInventoryRepository interface.
 * Delegates calls to the external hotel inventory client adapter.
 */
export class HotelInventoryRepositoryImpl implements HotelInventoryRepository {
	/**
	 * Retrieves inventory statistics from the external provider.
	 */
	getInventoryStatistics(
		query: InventoryStatisticsQuery,
		headers: HotelInventoryRequestHeaders,
	): Promise<InventoryStatisticsResponse> {
		return fetchInventoryStatistics(query, headers);
	}
}
