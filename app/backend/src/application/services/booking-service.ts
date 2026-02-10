import type { Booking, CreateBookingData } from '../../domain/models/booking.js';
import type { BookingRepository } from '../../domain/repositories/booking-repository.js';

export class BookingService {
	constructor(private bookingRepository: BookingRepository) {}

	async getBooking(id: string): Promise<Booking | null> {
		return this.bookingRepository.findById(id);
	}

	async getAllBookings(): Promise<Booking[]> {
		return this.bookingRepository.findAll();
	}

	async createBooking(data: CreateBookingData): Promise<Booking> {
		// Business logic validation
		if (data.startDate >= data.endDate) {
			throw new Error('End date must be after start date');
		}

		return this.bookingRepository.create(data);
	}

	async updateBooking(id: string, data: Partial<Booking>): Promise<Booking | null> {
		// Business logic validation
		if (data.startDate && data.endDate && data.startDate >= data.endDate) {
			throw new Error('End date must be after start date');
		}

		return this.bookingRepository.update(id, data);
	}

	async deleteBooking(id: string): Promise<boolean> {
		return this.bookingRepository.delete(id);
	}
}
