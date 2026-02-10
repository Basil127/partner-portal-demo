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
import {
	fetchHotelAvailability,
	fetchPropertyOffer,
	fetchPropertyOffers,
} from '../../adapters/http/hotel-shop/hotel-shop-client.js';

export class HotelShopRepositoryImpl implements HotelShopRepository {
	getAvailableHotels(
		query: HotelAvailabilitySearchQuery,
		headers: HotelAvailabilityRequestHeaders,
	): Promise<PropertySearchResponse> {
		return fetchHotelAvailability(query, headers);
	}

	getPropertyOffers(
		query: HotelPropertyOffersSearchQuery,
		headers: HotelShopRequestHeaders,
	): Promise<PropertyOffersResponse> {
		return fetchPropertyOffers(query, headers);
	}

	getPropertyOffer(
		query: HotelPropertyOfferQuery,
		headers: HotelShopRequestHeaders,
	): Promise<OfferDetailsResponse> {
		return fetchPropertyOffer(query, headers);
	}
}
