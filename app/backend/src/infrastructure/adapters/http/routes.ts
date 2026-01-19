import { FastifyInstance } from 'fastify';
import { BookingController } from '../../controllers/booking-controller';
import { BookingService } from '../../../application/services/booking-service';
import { BookingRepositoryImpl } from '../../repositories/booking-repository-impl';
import { createDatabaseAdapter } from '../database';

export function setupRoutes(fastify: FastifyInstance) {
  // Initialize dependencies
  const dbAdapter = createDatabaseAdapter();
  const bookingRepository = new BookingRepositoryImpl(dbAdapter);
  const bookingService = new BookingService(bookingRepository);
  const bookingController = new BookingController(bookingService);

  // Booking routes
  fastify.get('/api/bookings', {
    schema: {
      tags: ['bookings'],
      description: 'Get all bookings',
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              partnerId: { type: 'string' },
              customerName: { type: 'string' },
              serviceType: { type: 'string' },
              startDate: { type: 'string' },
              endDate: { type: 'string' },
              status: { type: 'string' },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' },
            },
          },
        },
      },
    },
    handler: bookingController.getAllBookings.bind(bookingController),
  });

  fastify.get('/api/bookings/:id', {
    schema: {
      tags: ['bookings'],
      description: 'Get a booking by ID',
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            partnerId: { type: 'string' },
            customerName: { type: 'string' },
            serviceType: { type: 'string' },
            startDate: { type: 'string' },
            endDate: { type: 'string' },
            status: { type: 'string' },
            createdAt: { type: 'string' },
            updatedAt: { type: 'string' },
          },
        },
        404: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
    handler: bookingController.getBooking.bind(bookingController),
  });

  fastify.post('/api/bookings', {
    schema: {
      tags: ['bookings'],
      description: 'Create a new booking',
      body: {
        type: 'object',
        required: ['partnerId', 'customerName', 'serviceType', 'startDate', 'endDate'],
        properties: {
          partnerId: { type: 'string' },
          customerName: { type: 'string' },
          serviceType: { type: 'string' },
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' },
        },
      },
      response: {
        201: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            partnerId: { type: 'string' },
            customerName: { type: 'string' },
            serviceType: { type: 'string' },
            startDate: { type: 'string' },
            endDate: { type: 'string' },
            status: { type: 'string' },
            createdAt: { type: 'string' },
            updatedAt: { type: 'string' },
          },
        },
      },
    },
    handler: bookingController.createBooking.bind(bookingController),
  });

  fastify.put('/api/bookings/:id', {
    schema: {
      tags: ['bookings'],
      description: 'Update a booking',
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
      },
      body: {
        type: 'object',
        properties: {
          customerName: { type: 'string' },
          status: { type: 'string', enum: ['pending', 'confirmed', 'cancelled', 'completed'] },
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            partnerId: { type: 'string' },
            customerName: { type: 'string' },
            serviceType: { type: 'string' },
            startDate: { type: 'string' },
            endDate: { type: 'string' },
            status: { type: 'string' },
            createdAt: { type: 'string' },
            updatedAt: { type: 'string' },
          },
        },
        404: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
    handler: bookingController.updateBooking.bind(bookingController),
  });

  fastify.delete('/api/bookings/:id', {
    schema: {
      tags: ['bookings'],
      description: 'Delete a booking',
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
      },
      response: {
        204: {
          type: 'null',
        },
        404: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
    handler: bookingController.deleteBooking.bind(bookingController),
  });
}
