import { HotelAvailabilityService } from '../../src/application/services/hotel-availability-service.js';
import type { HotelAvailabilityRepository } from '../../src/domain/repositories/hotel-availability-repository.js';
import type {
	HotelAvailabilityRequestHeaders,
	HotelAvailabilitySearchQuery,
	PropertySearchResponse,
} from '@partner-portal/shared';

describe('HotelAvailabilityService', () => {
	let service: HotelAvailabilityService;
	let repository: jest.Mocked<HotelAvailabilityRepository>;

	beforeEach(() => {
		repository = {
			getAvailableHotels: jest.fn(),
		};
		service = new HotelAvailabilityService(repository);
	});

	it('should return available hotels from repository', async () => {
		const query: HotelAvailabilitySearchQuery = {
			hotelCodes: 'OHM1,OHM2',
			arrivalDate: '2026-01-01',
			departureDate: '2026-01-03',
		};
		const headers: HotelAvailabilityRequestHeaders = {
			channelCode: 'demo-channel',
		};
		const expected: PropertySearchResponse = {
			roomStays: [
				{
					propertyInfo: { hotelCode: 'OHM1', hotelName: 'Hotel One' },
					availability: 'AvailableForSale',
				},
			],
		};

		repository.getAvailableHotels.mockResolvedValue(expected);

		const result = await service.getAvailableHotels(query, headers);

		expect(repository.getAvailableHotels).toHaveBeenCalledWith(query, headers);
		expect(result).toEqual(expected);
	});
});
