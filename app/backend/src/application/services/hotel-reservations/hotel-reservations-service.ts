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

export class HotelReservationsService {
	constructor(private readonly hotelReservationsRepository: HotelReservationsRepository) {}

	async getHotelReservations(
		hotelId: string,
		query: GetHotelReservationsQuery,
		headers: HotelReservationsRequestHeaders,
	): Promise<ReservationListResponse> {
		return this.hotelReservationsRepository.getHotelReservations(hotelId, query, headers);
	}

	async createReservation(
		hotelId: string,
		body: CreateReservationRequest,
		headers: HotelReservationsRequestHeaders,
	): Promise<ReservationListResponse> {
		return this.hotelReservationsRepository.createReservation(hotelId, body, headers);
	}

	async getReservationsSummary(
		hotelId: string,
		query: GetReservationsSummaryQuery,
		headers: HotelReservationsRequestHeaders,
	): Promise<ReservationSummaryResponse> {
		return this.hotelReservationsRepository.getReservationsSummary(hotelId, query, headers);
	}

	async getReservationStatistics(
		hotelId: string,
		query: GetReservationStatisticsQuery,
		headers: HotelReservationsRequestHeaders,
	): Promise<CheckDistributionReservationsSummary> {
		return this.hotelReservationsRepository.getReservationStatistics(hotelId, query, headers);
	}

	async updateReservation(
		hotelId: string,
		reservationId: string,
		body: CreateReservationRequest,
		headers: HotelReservationsRequestHeaders,
	): Promise<ReservationListResponse> {
		return this.hotelReservationsRepository.updateReservation(
			hotelId,
			reservationId,
			body,
			headers,
		);
	}

	async cancelReservation(
		hotelId: string,
		reservationId: string,
		body: CancelReservationRequest,
		headers: HotelReservationsRequestHeaders,
	): Promise<CancelReservationDetails> {
		return this.hotelReservationsRepository.cancelReservation(
			hotelId,
			reservationId,
			body,
			headers,
		);
	}
}
