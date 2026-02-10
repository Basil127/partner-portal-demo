import { HotelReservationsService } from '../../src/application/services/hotel-reservations/hotel-reservations-service.js';
import type { HotelReservationsRepository } from '../../src/domain/repositories/hotel-reservations/hotel-reservations-repository.js';
import type {
	CancelReservationDetails,
	CheckDistributionReservationsSummary,
	GetHotelReservationsQuery,
	GetReservationStatisticsQuery,
	GetReservationsSummaryQuery,
	HotelReservationsRequestHeaders,
	ReservationListResponse,
	ReservationSummaryResponse,
} from '@partner-portal/shared';

describe('HotelReservationsService', () => {
	let service: HotelReservationsService;
	let repository: jest.Mocked<HotelReservationsRepository>;

	beforeEach(() => {
		repository = {
			getHotelReservations: jest.fn(),
			createReservation: jest.fn(),
			getReservationsSummary: jest.fn(),
			getReservationStatistics: jest.fn(),
			updateReservation: jest.fn(),
			cancelReservation: jest.fn(),
		};
		service = new HotelReservationsService(repository);
	});

	it('should return hotel reservations from repository', async () => {
		const hotelId = 'HTL1';
		const query: GetHotelReservationsQuery = { limit: 10 };
		const headers: HotelReservationsRequestHeaders = { channelCode: 'OPERA' };
		const expected: ReservationListResponse = {
			reservations: {
				reservation: [{ hotelId: 'HTL1', reservationStatus: 'Reserved' }],
			},
		};

		repository.getHotelReservations.mockResolvedValue(expected);

		const result = await service.getHotelReservations(hotelId, query, headers);

		expect(repository.getHotelReservations).toHaveBeenCalledWith(hotelId, query, headers);
		expect(result).toEqual(expected);
	});

	it('should create a reservation via repository', async () => {
		const hotelId = 'HTL1';
		const body = { guestId: 'G1' };
		const headers: HotelReservationsRequestHeaders = { channelCode: 'OPERA' };
		const expected: ReservationListResponse = {
			reservations: {
				reservation: [{ hotelId: 'HTL1', reservationStatus: 'Reserved' }],
			},
		};

		repository.createReservation.mockResolvedValue(expected);

		const result = await service.createReservation(hotelId, body, headers);

		expect(repository.createReservation).toHaveBeenCalledWith(hotelId, body, headers);
		expect(result).toEqual(expected);
	});

	it('should return reservations summary from repository', async () => {
		const hotelId = 'HTL1';
		const query: GetReservationsSummaryQuery = { limit: 10 };
		const headers: HotelReservationsRequestHeaders = { channelCode: 'OPERA' };
		const expected: ReservationSummaryResponse = {
			reservations: [{ reservationId: '123', guestName: 'John Doe' }],
		};

		repository.getReservationsSummary.mockResolvedValue(expected);

		const result = await service.getReservationsSummary(hotelId, query, headers);

		expect(repository.getReservationsSummary).toHaveBeenCalledWith(hotelId, query, headers);
		expect(result).toEqual(expected);
	});

	it('should return reservation statistics from repository', async () => {
		const hotelId = 'HTL1';
		const query: GetReservationStatisticsQuery = { limit: 20 };
		const headers: HotelReservationsRequestHeaders = { channelCode: 'OPERA' };
		const expected: CheckDistributionReservationsSummary = {
			statistics: [{ date: '2023-01-01', count: 5 }],
		};

		repository.getReservationStatistics.mockResolvedValue(expected);

		const result = await service.getReservationStatistics(hotelId, query, headers);

		expect(repository.getReservationStatistics).toHaveBeenCalledWith(hotelId, query, headers);
		expect(result).toEqual(expected);
	});

	it('should update a reservation via repository', async () => {
		const hotelId = 'HTL1';
		const reservationId = '123';
		const body = { guestId: 'G1' };
		const headers: HotelReservationsRequestHeaders = { channelCode: 'OPERA' };
		const expected: ReservationListResponse = {
			reservations: {
				reservation: [{ hotelId: 'HTL1', reservationStatus: 'Reserved' }],
			},
		};

		repository.updateReservation.mockResolvedValue(expected);

		const result = await service.updateReservation(hotelId, reservationId, body, headers);

		expect(repository.updateReservation).toHaveBeenCalledWith(
			hotelId,
			reservationId,
			body,
			headers,
		);
		expect(result).toEqual(expected);
	});

	it('should cancel a reservation via repository', async () => {
		const hotelId = 'HTL1';
		const reservationId = '123';
		const body = { reason: { code: 'ABC' } };
		const headers: HotelReservationsRequestHeaders = { channelCode: 'OPERA' };
		const expected: CancelReservationDetails = {
			cancellationNumber: 'C123',
			status: 'Cancelled',
		};

		repository.cancelReservation.mockResolvedValue(expected);

		const result = await service.cancelReservation(hotelId, reservationId, body, headers);

		expect(repository.cancelReservation).toHaveBeenCalledWith(
			hotelId,
			reservationId,
			body,
			headers,
		);
		expect(result).toEqual(expected);
	});
});
