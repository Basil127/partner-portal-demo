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

export interface HotelShopRepository {
	getAvailableHotels(
		query: HotelAvailabilitySearchQuery,
		headers: HotelAvailabilityRequestHeaders,
	): Promise<PropertySearchResponse>;
	getPropertyOffers(
		query: HotelPropertyOffersSearchQuery,
		headers: HotelShopRequestHeaders,
	): Promise<PropertyOffersResponse>;
	getPropertyOffer(
		query: HotelPropertyOfferQuery,
		headers: HotelShopRequestHeaders,
	): Promise<OfferDetailsResponse>;
}
