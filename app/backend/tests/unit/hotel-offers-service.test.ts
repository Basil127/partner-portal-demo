import { HotelShopService } from '../../src/application/services/hotel-shop/hotel-shop-service.js';
import type { HotelShopRepository } from '../../src/domain/repositories/hotel-shop/hotel-shop-repository.js';
import type {
	HotelPropertyOfferQuery,
	HotelPropertyOffersSearchQuery,
	HotelShopRequestHeaders,
	OfferDetailsResponse,
	PropertyOffersResponse,
} from '@partner-portal/shared';

describe('HotelShopService (offers)', () => {
	let service: HotelShopService;
	let repository: jest.Mocked<HotelShopRepository>;

	beforeEach(() => {
		repository = {
			getPropertyOffers: jest.fn(),
			getPropertyOffer: jest.fn(),
			getAvailableHotels: jest.fn(),
		};
		service = new HotelShopService(repository);
	});

	it('should return property offers from repository', async () => {
		const query: HotelPropertyOffersSearchQuery = {
			hotelCode: 'OHM1',
			arrivalDate: '2026-01-01',
			departureDate: '2026-01-03',
		};
		const headers: HotelShopRequestHeaders = {
			channelCode: 'demo-channel',
		};
		const expected: PropertyOffersResponse = {
			roomStays: [
				{
					propertyInfo: { hotelCode: 'OHM1', hotelName: 'Hotel One' },
					offers: [{ offerId: 'OFF1' }],
				},
			],
		};

		repository.getPropertyOffers.mockResolvedValue(expected);

		const result = await service.getPropertyOffers(query, headers);

		expect(repository.getPropertyOffers).toHaveBeenCalledWith(query, headers);
		expect(result).toEqual(expected);
	});

	it('should return property offer from repository', async () => {
		const query: HotelPropertyOfferQuery = {
			hotelCode: 'OHM1',
			arrivalDate: '2026-01-01',
			departureDate: '2026-01-03',
		};
		const headers: HotelShopRequestHeaders = {
			channelCode: 'demo-channel',
		};
		const expected: OfferDetailsResponse = {
			propertyInfo: { hotelCode: 'OHM1', hotelName: 'Hotel One' },
			offer: { offerId: 'OFF1' },
		};

		repository.getPropertyOffer.mockResolvedValue(expected);

		const result = await service.getPropertyOffer(query, headers);

		expect(repository.getPropertyOffer).toHaveBeenCalledWith(query, headers);
		expect(result).toEqual(expected);
	});
});
