import { Booking, CreateBookingData } from '../models/booking';

export interface BookingRepository {
  findById(id: string): Promise<Booking | null>;
  findAll(): Promise<Booking[]>;
  create(data: CreateBookingData): Promise<Booking>;
  update(id: string, data: Partial<Booking>): Promise<Booking | null>;
  delete(id: string): Promise<boolean>;
}
