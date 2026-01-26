import type { FastifyInstance } from 'fastify';
import { BookingController } from '../../controllers/booking-controller.js';
import { HotelShopController } from '../../controllers/hotel-shop/hotel-shop-controller.js';
import { BookingService } from '../../../application/services/booking-service.js';
import { HotelShopService } from '../../../application/services/hotel-shop/hotel-shop-service.js';
import { BookingRepositoryImpl } from '../../repositories/booking-repository-impl.js';
import { HotelShopRepositoryImpl } from '../../repositories/hotel-shop/hotel-shop-repository-impl.js';
import { createDatabaseAdapter } from '../database.js';

export function setupRoutes(fastify: FastifyInstance) {
	// Initialize dependencies
	const dbAdapter = createDatabaseAdapter();
	const bookingRepository = new BookingRepositoryImpl(dbAdapter);
	const bookingService = new BookingService(bookingRepository);
	const bookingController = new BookingController(bookingService);
	const hotelShopRepository = new HotelShopRepositoryImpl();
	const hotelShopService = new HotelShopService(hotelShopRepository);
	const hotelShopController = new HotelShopController(hotelShopService);

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

	fastify.get('/api/hotels/availability', {
		schema: {
			tags: ['hotel shop'],
			description: 'Get available hotels from external provider',
			querystring: {
				type: 'object',
				required: ['hotelCodes', 'arrivalDate', 'departureDate'],
				properties: {
					hotelCodes: { type: 'string', description: 'List of Hotel Codes (CSV)' },
					arrivalDate: { type: 'string', format: 'date' },
					arrivalDateTo: { type: 'string', format: 'date' },
					departureDate: { type: 'string', format: 'date' },
					adults: { type: 'integer', minimum: 1 },
					children: { type: 'integer', minimum: 0 },
					childrenAges: { type: 'string' },
					ratePlanCodes: { type: 'string' },
					accessCode: { type: 'string' },
					numberOfUnits: { type: 'integer', minimum: 1 },
					rateMode: { type: 'string' },
					ratePlanCodeMatchOnly: { type: 'boolean' },
					ratePlanType: { type: 'string' },
					availableOnly: { type: 'boolean' },
					minRate: { type: 'number' },
					maxRate: { type: 'number' },
					alternateOffers: { type: 'string' },
					commissionableStatus: { type: 'string' },
					promotionCodes: { type: 'string' },
				},
			},
			response: {
				200: {
					type: 'object',
					properties: {
						roomStays: {
							type: 'array',
							items: { type: 'object' },
							nullable: true,
						},
					},
				},
				400: {
					type: 'object',
					properties: {
						error: { type: 'string' },
						details: { type: 'array' },
					},
				},
			},
		},
		handler: hotelShopController.getAvailableHotels.bind(hotelShopController),
	});

	fastify.get('/api/hotels/:hotelCode/offers', {
		schema: {
			tags: ['hotel shop'],
			description: 'Get property offers from external provider',
			params: {
				type: 'object',
				required: ['hotelCode'],
				properties: {
					hotelCode: { type: 'string' },
				},
			},
			querystring: {
				type: 'object',
				required: ['arrivalDate', 'departureDate'],
				properties: {
					arrivalDate: { type: 'string', format: 'date' },
					departureDate: { type: 'string', format: 'date' },
					adults: { type: 'integer', minimum: 1 },
					children: { type: 'integer', minimum: 0 },
					childrenAges: { type: 'string' },
					roomTypes: { type: 'string' },
					ratePlanCodes: { type: 'string' },
					accessCode: { type: 'string' },
					ratePlanType: { type: 'string' },
					numberOfUnits: { type: 'integer', minimum: 1 },
					roomTypeMatchOnly: { type: 'boolean' },
					ratePlanCodeMatchOnly: { type: 'boolean' },
					rateMode: { type: 'string' },
					roomAmenity: { type: 'string' },
					roomAmenityQuantity: { type: 'integer', minimum: 0 },
					includeAmenities: { type: 'boolean' },
					minRate: { type: 'number' },
					maxRate: { type: 'number' },
					alternateOffers: { type: 'string' },
					commissionableStatus: { type: 'string' },
					promotionCodes: { type: 'string' },
					blockCode: { type: 'string' },
				},
			},
			response: {
				200: {
					type: 'object',
					properties: {
						roomStays: {
							type: 'array',
							items: { type: 'object' },
							nullable: true,
						},
					},
				},
				400: {
					type: 'object',
					properties: {
						error: { type: 'string' },
						details: { type: 'array' },
					},
				},
			},
		},
		handler: hotelShopController.getPropertyOffers.bind(hotelShopController),
	});

	fastify.get('/api/hotels/:hotelCode/offer', {
		schema: {
			tags: ['hotel shop'],
			description: 'Get a property offer from external provider',
			params: {
				type: 'object',
				required: ['hotelCode'],
				properties: {
					hotelCode: { type: 'string' },
				},
			},
			querystring: {
				type: 'object',
				required: ['arrivalDate', 'departureDate'],
				properties: {
					arrivalDate: { type: 'string', format: 'date' },
					departureDate: { type: 'string', format: 'date' },
					adults: { type: 'integer', minimum: 1 },
					children: { type: 'integer', minimum: 0 },
					childrenAges: { type: 'string' },
					roomType: { type: 'string' },
					ratePlanCode: { type: 'string' },
					accessCode: { type: 'string' },
					rateMode: { type: 'string' },
					numberOfUnits: { type: 'integer', minimum: 1 },
					bookingCode: { type: 'string' },
					includeAmenities: { type: 'boolean' },
					promotionCodes: { type: 'string' },
					blockCode: { type: 'string' },
				},
			},
			response: {
				200: {
					type: 'object',
					properties: {
						propertyInfo: { type: 'object', nullable: true },
						availability: { type: 'string', nullable: true },
						roomType: { type: 'object', nullable: true },
						ratePlan: { type: 'object', nullable: true },
						offer: { type: 'object', nullable: true },
					},
				},
				400: {
					type: 'object',
					properties: {
						error: { type: 'string' },
						details: { type: 'array' },
					},
				},
			},
		},
		handler: hotelShopController.getPropertyOffer.bind(hotelShopController),
	});
}
