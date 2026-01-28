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
import type { HotelReservationsRepository } from '../../../domain/repositories/hotel-reservations/hotel-reservations-repository.js';
import * as hotelReservationsClient from '../../adapters/http/hotel-reservations/hotel-reservations-client.js';

export class HotelReservationsRepositoryImpl implements HotelReservationsRepository {
	async getHotelReservations(
		hotelId: string,
		query: GetHotelReservationsQuery,
		headers: HotelReservationsRequestHeaders,
	): Promise<ReservationListResponse> {
		return hotelReservationsClient.fetchHotelReservations(hotelId, query, headers);
	}

	async createReservation(
		hotelId: string,
		body: CreateReservationRequest,
		headers: HotelReservationsRequestHeaders,
	): Promise<ReservationListResponse> {
		return hotelReservationsClient.postCreateReservation(hotelId, body, headers);
	}

	async getReservationsSummary(
		hotelId: string,
		query: GetReservationsSummaryQuery,
		headers: HotelReservationsRequestHeaders,
	): Promise<ReservationSummaryResponse> {
		return hotelReservationsClient.fetchReservationsSummary(hotelId, query, headers);
	}

	async getReservationStatistics(
		hotelId: string,
		query: GetReservationStatisticsQuery,
		headers: HotelReservationsRequestHeaders,
	): Promise<CheckDistributionReservationsSummary> {
		return hotelReservationsClient.fetchReservationStatistics(hotelId, query, headers);
	}

	async updateReservation(
		hotelId: string,
		reservationId: string,
		body: CreateReservationRequest,
		headers: HotelReservationsRequestHeaders,
	): Promise<ReservationListResponse> {
		return hotelReservationsClient.putUpdateReservation(hotelId, reservationId, body, headers);
	}

	async cancelReservation(
		hotelId: string,
		reservationId: string,
		body: CancelReservationRequest,
		headers: HotelReservationsRequestHeaders,
	): Promise<CancelReservationDetails> {
		return hotelReservationsClient.postCancelReservation(hotelId, reservationId, body, headers);
	}
}
