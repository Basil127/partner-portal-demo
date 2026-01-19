import { BookingStatus } from '../../domain/models/booking.js';
import type { Booking, CreateBookingData } from '../../domain/models/booking.js';
import type { BookingRepository } from '../../domain/repositories/booking-repository.js';
import type { DatabaseAdapter } from '../adapters/database.js';
import { randomUUID } from 'crypto';

export class BookingRepositoryImpl implements BookingRepository {
  constructor(private db: DatabaseAdapter) {}

  async findById(id: string): Promise<Booking | null> {
    const rows = await this.db.query(
      'SELECT * FROM bookings WHERE id = ?',
      [id]
    );
    return rows.length > 0 ? this.mapToBooking(rows[0] as Record<string, unknown>) : null;
  }

  async findAll(): Promise<Booking[]> {
    const rows = await this.db.query('SELECT * FROM bookings ORDER BY created_at DESC');
    return rows.map((row) => this.mapToBooking(row as Record<string, unknown>));
  }

  async create(data: CreateBookingData): Promise<Booking> {
    const id = randomUUID();
    const now = new Date();
    
    await this.db.execute(
      `INSERT INTO bookings (id, partner_id, customer_name, service_type, start_date, end_date, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.partnerId,
        data.customerName,
        data.serviceType,
        data.startDate.toISOString(),
        data.endDate.toISOString(),
        BookingStatus.PENDING,
        now.toISOString(),
        now.toISOString(),
      ]
    );

    const booking = await this.findById(id);
    if (!booking) {
      throw new Error('Failed to create booking');
    }
    return booking;
  }

  async update(id: string, data: Partial<Booking>): Promise<Booking | null> {
    const existing = await this.findById(id);
    if (!existing) {
      return null;
    }

    const updates: string[] = [];
    const values: unknown[] = [];

    if (data.customerName) {
      updates.push('customer_name = ?');
      values.push(data.customerName);
    }
    if (data.status) {
      updates.push('status = ?');
      values.push(data.status);
    }
    if (data.startDate) {
      updates.push('start_date = ?');
      values.push(data.startDate.toISOString());
    }
    if (data.endDate) {
      updates.push('end_date = ?');
      values.push(data.endDate.toISOString());
    }

    updates.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(id);

    await this.db.execute(
      `UPDATE bookings SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const existing = await this.findById(id);
    if (!existing) {
      return false;
    }

    await this.db.execute('DELETE FROM bookings WHERE id = ?', [id]);
    return true;
  }

  private mapToBooking(row: Record<string, unknown>): Booking {
    return {
      id: row.id as string,
      partnerId: row.partner_id as string,
      customerName: row.customer_name as string,
      serviceType: row.service_type as string,
      startDate: new Date(row.start_date as string),
      endDate: new Date(row.end_date as string),
      status: row.status as BookingStatus,
      createdAt: new Date(row.created_at as string),
      updatedAt: new Date(row.updated_at as string),
    };
  }
}
