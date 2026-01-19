import { FastifyRequest, FastifyReply } from 'fastify';
import { BookingService } from '../../application/services/booking-service';
import { Booking, BookingStatus, CreateBookingData } from '../../domain/models/booking';
import { z } from 'zod';

const CreateBookingSchema = z.object({
  partnerId: z.string().uuid(),
  customerName: z.string().min(1),
  serviceType: z.string().min(1),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

const UpdateBookingSchema = z.object({
  customerName: z.string().min(1).optional(),
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export class BookingController {
  constructor(private bookingService: BookingService) {}

  async getBooking(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const booking = await this.bookingService.getBooking(request.params.id);
      if (!booking) {
        return reply.status(404).send({ error: 'Booking not found' });
      }
      return reply.send(booking);
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  async getAllBookings(request: FastifyRequest, reply: FastifyReply) {
    try {
      const bookings = await this.bookingService.getAllBookings();
      return reply.send(bookings);
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  async createBooking(request: FastifyRequest, reply: FastifyReply) {
    try {
      const validatedData = CreateBookingSchema.parse(request.body);
      const data: CreateBookingData = {
        ...validatedData,
        startDate: new Date(validatedData.startDate),
        endDate: new Date(validatedData.endDate),
      };

      const booking = await this.bookingService.createBooking(data);
      return reply.status(201).send(booking);
    } catch (error) {
      request.log.error(error);
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Validation error', details: error.errors });
      }
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  async updateBooking(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const validatedData = UpdateBookingSchema.parse(request.body);
      const data: Partial<Booking> = {};
      
      if (validatedData.customerName) {
        data.customerName = validatedData.customerName;
      }
      if (validatedData.status) {
        data.status = validatedData.status as BookingStatus;
      }
      if (validatedData.startDate) {
        data.startDate = new Date(validatedData.startDate);
      }
      if (validatedData.endDate) {
        data.endDate = new Date(validatedData.endDate);
      }

      const booking = await this.bookingService.updateBooking(request.params.id, data);
      if (!booking) {
        return reply.status(404).send({ error: 'Booking not found' });
      }
      return reply.send(booking);
    } catch (error) {
      request.log.error(error);
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Validation error', details: error.errors });
      }
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  async deleteBooking(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const deleted = await this.bookingService.deleteBooking(request.params.id);
      if (!deleted) {
        return reply.status(404).send({ error: 'Booking not found' });
      }
      return reply.status(204).send();
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }
}
