import { HotelInventoryService } from '../../src/application/services/hotel-inventory/hotel-inventory-service.js';
import type { HotelInventoryRepository } from '../../src/domain/repositories/hotel-inventory/hotel-inventory-repository.js';
import type {
	HotelInventoryRequestHeaders,
	InventoryStatisticsQuery,
	InventoryStatisticsResponse,
} from '@partner-portal/shared';

describe('HotelInventoryService', () => {
	let service: HotelInventoryService;
	let repository: jest.Mocked<HotelInventoryRepository>;

	beforeEach(() => {
		repository = {
			getInventoryStatistics: jest.fn(),
		};
		service = new HotelInventoryService(repository);
	});

	describe('getInventoryStatistics', () => {
		it('should return inventory statistics from repository', async () => {
			const query: InventoryStatisticsQuery = {
				hotelId: 'HOTEL123',
				dateRangeStart: '2026-01-01',
				dateRangeEnd: '2026-01-31',
				reportCode: 'RoomsAvailabilitySummary',
			};
			const headers: HotelInventoryRequestHeaders = {
				channelCode: 'demo-channel',
			};
			const expected: InventoryStatisticsResponse = [
				{
					hotelName: 'Test Hotel',
					reportCode: 'RoomsAvailabilitySummary',
					description: 'Room availability summary for January 2026',
					statistics: [
						{
							statCode: 'ROOM',
							statCategoryCode: 'Inventory',
							description: 'Room inventory statistics',
							statisticDate: [
								{
									statisticDate: '2026-01-01',
									weekendDate: false,
									inventory: [
										{
											categoryCode: 'AVAILABLE',
											description: 'Available rooms',
											value: 50,
										},
									],
									revenue: null,
								},
							],
						},
					],
				},
			];

			repository.getInventoryStatistics.mockResolvedValue(expected);

			const result = await service.getInventoryStatistics(query, headers);

			expect(repository.getInventoryStatistics).toHaveBeenCalledWith(query, headers);
			expect(result).toEqual(expected);
		});

		it('should pass optional parameters to repository', async () => {
			const query: InventoryStatisticsQuery = {
				hotelId: 'HOTEL456',
				dateRangeStart: '2026-02-01',
				dateRangeEnd: '2026-02-28',
				reportCode: 'DetailedAvailabiltySummary',
				parameterName: ['roomType', 'rateCode'],
				parameterValue: ['SUITE', 'RACK'],
			};
			const headers: HotelInventoryRequestHeaders = {
				channelCode: 'demo-channel',
				authorization: 'Bearer test-token',
				appKey: 'test-app-key',
			};
			const expected: InventoryStatisticsResponse = [];

			repository.getInventoryStatistics.mockResolvedValue(expected);

			const result = await service.getInventoryStatistics(query, headers);

			expect(repository.getInventoryStatistics).toHaveBeenCalledWith(query, headers);
			expect(result).toEqual(expected);
		});

		it('should propagate errors from repository', async () => {
			const query: InventoryStatisticsQuery = {
				hotelId: 'INVALID',
				dateRangeStart: '2026-01-01',
				dateRangeEnd: '2026-01-31',
				reportCode: 'SellLimitSummary',
			};
			const headers: HotelInventoryRequestHeaders = {
				channelCode: 'demo-channel',
			};
			const error = new Error('External API error');

			repository.getInventoryStatistics.mockRejectedValue(error);

			await expect(service.getInventoryStatistics(query, headers)).rejects.toThrow(
				'External API error',
			);
		});
	});
});
