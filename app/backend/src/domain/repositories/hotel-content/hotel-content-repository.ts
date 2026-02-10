import type {
	HotelContentRequestHeaders,
	PropertiesSummaryQuery,
	PropertyInfoResponse,
	PropertyInfoSummaryResponse,
	RoomTypesQuery,
	RoomTypesResponse,
} from '@partner-portal/shared';

export interface HotelContentRepository {
	getPropertiesSummary(
		query: PropertiesSummaryQuery,
		headers: HotelContentRequestHeaders,
	): Promise<PropertyInfoSummaryResponse>;

	getPropertyInfo(
		hotelCode: string,
		headers: HotelContentRequestHeaders,
	): Promise<PropertyInfoResponse>;

	getRoomTypes(
		hotelCode: string,
		query: RoomTypesQuery,
		headers: HotelContentRequestHeaders,
	): Promise<RoomTypesResponse>;
}
