import type {
	CancelReservationDetails,
	CancelReservationRequest,
	CheckDistributionReservationsSummary,
	CreateReservationRequest,
	GetHotelReservationsQuery,
	GetReservationStatisticsQuery,
	GetReservationsSummaryQuery,
	HotelReservationsRequestHeaders,
	ReservationListResponse,
	ReservationSummaryResponse,
} from '@partner-portal/shared';

export interface HotelReservationsRepository {
	getHotelReservations(
		hotelId: string,
		query: GetHotelReservationsQuery,
		headers: HotelReservationsRequestHeaders,
	): Promise<ReservationListResponse>;

	createReservation(
		hotelId: string,
		body: CreateReservationRequest,
		headers: HotelReservationsRequestHeaders,
	): Promise<ReservationListResponse>;

	getReservationsSummary(
		hotelId: string,
		query: GetReservationsSummaryQuery,
		headers: HotelReservationsRequestHeaders,
	): Promise<ReservationSummaryResponse>;

	getReservationStatistics(
		hotelId: string,
		query: GetReservationStatisticsQuery,
		headers: HotelReservationsRequestHeaders,
	): Promise<CheckDistributionReservationsSummary>;

	updateReservation(
		hotelId: string,
		reservationId: string,
		body: CreateReservationRequest,
		headers: HotelReservationsRequestHeaders,
	): Promise<ReservationListResponse>;

	cancelReservation(
		hotelId: string,
		reservationId: string,
		body: CancelReservationRequest,
		headers: HotelReservationsRequestHeaders,
	): Promise<CancelReservationDetails>;
}
