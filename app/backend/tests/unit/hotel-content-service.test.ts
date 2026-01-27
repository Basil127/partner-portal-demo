import { HotelContentService } from '../../src/application/services/hotel-content/hotel-content-service.js';
import type { HotelContentRepository } from '../../src/domain/repositories/hotel-content/hotel-content-repository.js';
import type {
	HotelContentRequestHeaders,
	PropertiesSummaryQuery,
	PropertyInfoResponse,
	PropertyInfoSummaryResponse,
	RoomTypesQuery,
	RoomTypesResponse,
} from '@partner-portal/shared';

describe('HotelContentService', () => {
	let service: HotelContentService;
	let repository: jest.Mocked<HotelContentRepository>;

	beforeEach(() => {
		repository = {
			getPropertiesSummary: jest.fn(),
			getPropertyInfo: jest.fn(),
			getRoomTypes: jest.fn(),
		};
		service = new HotelContentService(repository);
	});

	it('should return properties summary from repository', async () => {
		const query: PropertiesSummaryQuery = { limit: 10 };
		const headers: HotelContentRequestHeaders = { channelCode: 'OPERA' };
		const expected: PropertyInfoSummaryResponse = {
			hotels: [{ hotelCode: 'HTL1', hotelName: 'Hotel 1' }],
		};

		repository.getPropertiesSummary.mockResolvedValue(expected);

		const result = await service.getPropertiesSummary(query, headers);

		expect(repository.getPropertiesSummary).toHaveBeenCalledWith(query, headers);
		expect(result).toEqual(expected);
	});

	it('should return property info from repository', async () => {
		const hotelCode = 'HTL1';
		const headers: HotelContentRequestHeaders = { channelCode: 'OPERA' };
		const expected: PropertyInfoResponse = {
			propertyInfo: { hotelCode: 'HTL1', hotelName: 'Hotel 1' },
		};

		repository.getPropertyInfo.mockResolvedValue(expected);

		const result = await service.getPropertyInfo(hotelCode, headers);

		expect(repository.getPropertyInfo).toHaveBeenCalledWith(hotelCode, headers);
		expect(result).toEqual(expected);
	});

	it('should return room types from repository', async () => {
		const hotelCode = 'HTL1';
		const query: RoomTypesQuery = { limit: 10 };
		const headers: HotelContentRequestHeaders = { channelCode: 'OPERA' };
		const expected: RoomTypesResponse = {
			roomTypes: [{ hotelRoomType: 'ROOM1', roomType: 'ROOM1' }],
		};

		repository.getRoomTypes.mockResolvedValue(expected);

		const result = await service.getRoomTypes(hotelCode, query, headers);

		expect(repository.getRoomTypes).toHaveBeenCalledWith(hotelCode, query, headers);
		expect(result).toEqual(expected);
	});
});
