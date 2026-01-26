import type {
	HotelAvailabilityRequestHeaders,
	HotelAvailabilitySearchQuery,
	HotelPropertyOfferQuery,
	HotelPropertyOffersSearchQuery,
	HotelShopRequestHeaders,
	OfferDetailsResponse,
	PropertyOffersResponse,
	PropertySearchResponse,
} from '@partner-portal/shared';
import type { HotelShopRepository } from '../../../domain/repositories/hotel-shop/hotel-shop-repository.js';

export class HotelShopService {
	constructor(private hotelShopRepository: HotelShopRepository) {}

	getAvailableHotels(
		query: HotelAvailabilitySearchQuery,
		headers: HotelAvailabilityRequestHeaders,
	): Promise<PropertySearchResponse> {
		return this.hotelShopRepository.getAvailableHotels(query, headers);
	}

	getPropertyOffers(
		query: HotelPropertyOffersSearchQuery,
		headers: HotelShopRequestHeaders,
	): Promise<PropertyOffersResponse> {
		return this.hotelShopRepository.getPropertyOffers(query, headers);
	}

	getPropertyOffer(
		query: HotelPropertyOfferQuery,
		headers: HotelShopRequestHeaders,
	): Promise<OfferDetailsResponse> {
		return this.hotelShopRepository.getPropertyOffer(query, headers);
	}
}
