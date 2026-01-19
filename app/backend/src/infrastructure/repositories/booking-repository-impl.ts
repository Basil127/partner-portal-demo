import { Booking, CreateBookingData, BookingStatus } from '../../domain/models/booking';
import { BookingRepository } from '../../domain/repositories/booking-repository';
import { DatabaseAdapter } from '../adapters/database';
import { randomUUID } from 'crypto';

export class BookingRepositoryImpl implements BookingRepository {
  constructor(private db: DatabaseAdapter) {}

  async findById(id: string): Promise<Booking | null> {
    const rows = await this.db.query(
      'SELECT * FROM bookings WHERE id = ?',
      [id]
    );
    return rows.length > 0 ? this.mapToBooking(rows[0]) : null;
  }

  async findAll(): Promise<Booking[]> {
    const rows = await this.db.query('SELECT * FROM bookings ORDER BY created_at DESC');
    return rows.map((row) => this.mapToBooking(row));
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

  private mapToBooking(row: any): Booking {
    return {
      id: row.id,
      partnerId: row.partner_id,
      customerName: row.customer_name,
      serviceType: row.service_type,
      startDate: new Date(row.start_date),
      endDate: new Date(row.end_date),
      status: row.status as BookingStatus,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
