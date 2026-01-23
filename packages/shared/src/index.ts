export enum BookingStatus {
	PENDING = 'pending',
	CONFIRMED = 'confirmed',
	CANCELLED = 'cancelled',
	COMPLETED = 'completed',
}

export type BookingStatusValue = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Booking {
	id: string;
	partnerId: string;
	customerName: string;
	serviceType: string;
	startDate: string; // ISO string for shared use
	endDate: string;
	status: BookingStatus;
	createdAt: string;
	updatedAt: string;
}

export interface CreateBookingData {
	partnerId: string;
	customerName: string;
	serviceType: string;
	startDate: string;
	endDate: string;
}
