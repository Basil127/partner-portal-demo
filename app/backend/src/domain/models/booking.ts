export interface Booking {
  id: string;
  partnerId: string;
  customerName: string;
  serviceType: string;
  startDate: Date;
  endDate: Date;
  status: BookingStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

export interface CreateBookingData {
  partnerId: string;
  customerName: string;
  serviceType: string;
  startDate: Date;
  endDate: Date;
}
