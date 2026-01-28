import type { FastifyInstance } from 'fastify';
import { BookingController } from '../../controllers/booking-controller.js';
import { HotelShopController } from '../../controllers/hotel-shop/hotel-shop-controller.js';
import { HotelContentController } from '../../controllers/hotel-content/hotel-content-controller.js';
import { HotelReservationsController } from '../../controllers/hotel-reservations/hotel-reservations-controller.js';
import { HotelInventoryController } from '../../controllers/hotel-inventory/hotel-inventory-controller.js';
import { BookingService } from '../../../application/services/booking-service.js';
import { HotelShopService } from '../../../application/services/hotel-shop/hotel-shop-service.js';
import { HotelContentService } from '../../../application/services/hotel-content/hotel-content-service.js';
import { HotelReservationsService } from '../../../application/services/hotel-reservations/hotel-reservations-service.js';
import { HotelInventoryService } from '../../../application/services/hotel-inventory/hotel-inventory-service.js';
import { BookingRepositoryImpl } from '../../repositories/booking-repository-impl.js';
import { HotelShopRepositoryImpl } from '../../repositories/hotel-shop/hotel-shop-repository-impl.js';
import { HotelContentRepositoryImpl } from '../../repositories/hotel-content/hotel-content-repository-impl.js';
import { HotelReservationsRepositoryImpl } from '../../repositories/hotel-reservations/hotel-reservations-repository-impl.js';
import { HotelInventoryRepositoryImpl } from '../../repositories/hotel-inventory/hotel-inventory-repository-impl.js';
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
	const hotelContentRepository = new HotelContentRepositoryImpl();
	const hotelContentService = new HotelContentService(hotelContentRepository);
	const hotelContentController = new HotelContentController(hotelContentService);
	const hotelReservationsRepository = new HotelReservationsRepositoryImpl();
	const hotelReservationsService = new HotelReservationsService(hotelReservationsRepository);
	const hotelReservationsController = new HotelReservationsController(hotelReservationsService);
	const hotelInventoryRepository = new HotelInventoryRepositoryImpl();
	const hotelInventoryService = new HotelInventoryService(hotelInventoryRepository);
	const hotelInventoryController = new HotelInventoryController(hotelInventoryService);

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

	// shop api endpoints
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
							nullable: true,
							items: {
								type: 'object',
								additionalProperties: true,
								properties: {
									propertyInfo: {
										type: 'object',
										nullable: true,
										additionalProperties: true,
										properties: {
											hotelCode: { type: 'string', nullable: true },
											hotelName: { type: 'string', nullable: true },
											chainCode: { type: 'string', nullable: true },
										},
									},
									availability: { type: 'string', nullable: true },
									ratePlans: {
										type: 'array',
										nullable: true,
										items: { type: 'object', additionalProperties: true },
									},
									minRate: {
										type: 'object',
										nullable: true,
										properties: {
											amountBeforeTax: { type: 'number', nullable: true },
											amountAfterTax: { type: 'number', nullable: true },
											currencyCode: { type: 'string', nullable: true },
										},
									},
									maxRate: {
										type: 'object',
										nullable: true,
										properties: {
											amountBeforeTax: { type: 'number', nullable: true },
											amountAfterTax: { type: 'number', nullable: true },
											currencyCode: { type: 'string', nullable: true },
										},
									},
								},
							},
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
							nullable: true,
							items: {
								type: 'object',
								additionalProperties: true,
								properties: {
									propertyInfo: {
										type: 'object',
										nullable: true,
										additionalProperties: true,
										properties: {
											hotelCode: { type: 'string', nullable: true },
											hotelName: { type: 'string', nullable: true },
											chainCode: { type: 'string', nullable: true },
										},
									},
									availability: { type: 'string', nullable: true },
									restrictions: {
										type: 'array',
										nullable: true,
										items: {
											type: 'object',
											properties: {
												code: { type: 'string', nullable: true },
												description: { type: 'string', nullable: true },
											},
										},
									},
									roomTypes: {
										type: 'array',
										nullable: true,
										items: {
											type: 'object',
											additionalProperties: true,
											properties: {
												roomTypeCode: { type: 'string', nullable: true },
												roomTypeName: { type: 'string', nullable: true },
												description: { type: 'string', nullable: true },
												availabilityStatus: { type: 'string', nullable: true },
											},
										},
									},
									ratePlans: {
										type: 'array',
										nullable: true,
										items: { type: 'object', additionalProperties: true },
									},
									offers: {
										type: 'array',
										nullable: true,
										items: { type: 'object', additionalProperties: true },
									},
								},
							},
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
						propertyInfo: {
							type: 'object',
							nullable: true,
							additionalProperties: true,
							properties: {
								hotelCode: { type: 'string', nullable: true },
								hotelName: { type: 'string', nullable: true },
								chainCode: { type: 'string', nullable: true },
							},
						},
						availability: { type: 'string', nullable: true },
						roomType: {
							type: 'object',
							nullable: true,
							additionalProperties: true,
							properties: {
								roomTypeCode: { type: 'string', nullable: true },
								roomTypeName: { type: 'string', nullable: true },
								description: { type: 'string', nullable: true },
								availabilityStatus: { type: 'string', nullable: true },
							},
						},
						ratePlan: {
							type: 'object',
							nullable: true,
							additionalProperties: true,
							properties: {
								ratePlanCode: { type: 'string', nullable: true },
								ratePlanName: { type: 'string', nullable: true },
								description: { type: 'string', nullable: true },
							},
						},
						offer: {
							type: 'object',
							nullable: true,
							additionalProperties: true,
							properties: {
								roomType: { type: 'string', nullable: true },
								ratePlanCode: { type: 'string', nullable: true },
								bookingCode: { type: 'string', nullable: true },
								total: {
									type: 'object',
									nullable: true,
									properties: {
										amountBeforeTax: { type: 'number', nullable: true },
										amountAfterTax: { type: 'number', nullable: true },
										currencyCode: { type: 'string', nullable: true },
									},
								},
							},
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
		handler: hotelShopController.getPropertyOffer.bind(hotelShopController),
	});

	// Hotel Content routes
	fastify.get('/api/content/hotels', {
		schema: {
			tags: ['hotel content'],
			description: 'Get properties summary',
			querystring: {
				type: 'object',
				properties: {
					connectionStatusLastChangedFrom: { type: 'string', format: 'date-time' },
					connectionStatusLastChangedTo: { type: 'string', format: 'date-time' },
					connectionStatus: { type: 'string' },
					fetchInstructions: { type: 'string' },
					limit: { type: 'integer', default: 20 },
					offset: { type: 'integer', default: 0 },
				},
			},
			response: {
				200: {
					type: 'object',
					properties: {
						hasMore: { type: 'boolean' },
						totalResults: { type: 'integer', nullable: true },
						limit: { type: 'integer' },
						count: { type: 'integer' },
						offset: { type: 'integer' },
						hotels: {
							type: 'array',
							items: {
								type: 'object',
								additionalProperties: true,
								properties: {
									hotelId: { type: 'string', nullable: true },
									hotelCode: { type: 'string', nullable: true },
									hotelName: { type: 'string', nullable: true },
									hotelDescription: { type: 'string', nullable: true },
								},
							},
						},
					},
				},
			},
		},
		handler: hotelContentController.getPropertiesSummary.bind(hotelContentController),
	});

	fastify.get('/api/content/hotels/:hotelCode', {
		schema: {
			tags: ['hotel content'],
			description: 'Get detailed property information',
			params: {
				type: 'object',
				required: ['hotelCode'],
				properties: {
					hotelCode: { type: 'string' },
				},
			},
			response: {
				200: {
					type: 'object',
					properties: {
						propertyInfo: {
							type: 'object',
							nullable: true,
							additionalProperties: true,
							properties: {
								hotelId: { type: 'string', nullable: true },
								enterpriseId: { type: 'string', nullable: true },
								hotelCode: { type: 'string', nullable: true },
								hotelName: { type: 'string', nullable: true },
								hotelDescription: { type: 'string', nullable: true },
								chainCode: { type: 'string', nullable: true },
							},
						},
					},
				},
			},
		},
		handler: hotelContentController.getPropertyInfo.bind(hotelContentController),
	});

	fastify.get('/api/content/hotels/:hotelCode/roomTypes', {
		schema: {
			tags: ['hotel content'],
			description: 'Get room types for a property',
			params: {
				type: 'object',
				required: ['hotelCode'],
				properties: {
					hotelCode: { type: 'string' },
				},
			},
			querystring: {
				type: 'object',
				properties: {
					includeRoomAmenities: { type: 'boolean', default: false },
					roomType: { type: 'string' },
					limit: { type: 'integer', default: 20 },
					offset: { type: 'integer', default: 0 },
				},
			},
			response: {
				200: {
					type: 'object',
					properties: {
						roomTypes: {
							type: 'array',
							nullable: true,
							items: {
								type: 'object',
								additionalProperties: true,
								properties: {
									hotelRoomType: { type: 'string', nullable: true },
									roomType: { type: 'string', nullable: true },
									roomName: { type: 'string', nullable: true },
								},
							},
						},
						count: { type: 'integer', nullable: true },
						hasMore: { type: 'boolean', nullable: true },
						limit: { type: 'integer', nullable: true },
						offset: { type: 'integer', nullable: true },
						totalResults: { type: 'integer', nullable: true },
					},
				},
			},
		},
		handler: hotelContentController.getRoomTypes.bind(hotelContentController),
	});

	// reservations api endpoints
	fastify.get('/api/hotels/:hotelId/reservations', {
		schema: {
			tags: ['hotel reservations'],
			description: 'Get reservations for a hotel',
			params: {
				type: 'object',
				required: ['hotelId'],
				properties: {
					hotelId: { type: 'string' },
				},
			},
			querystring: {
				type: 'object',
				properties: {
					surname: { type: 'string', nullable: true },
					givenName: { type: 'string', nullable: true },
					arrivalStartDate: { type: 'string', format: 'date', nullable: true },
					arrivalEndDate: { type: 'string', format: 'date', nullable: true },
					confirmationNumberList: {
						type: 'array',
						items: { type: 'string' },
						nullable: true,
					},
					limit: { type: 'integer', default: 100 },
					offset: { type: 'integer', default: 0 },
				},
			},
			response: {
				200: {
					type: 'object',
					properties: {
						reservations: {
							type: 'object',
							nullable: true,
							properties: {
								reservation: {
									type: 'array',
									nullable: true,
									items: {
										type: 'object',
										additionalProperties: true,
										properties: {
											reservationIdList: {
												type: 'array',
												nullable: true,
												items: {
													type: 'object',
													properties: {
														id: { type: 'string', nullable: true },
														type: { type: 'string', nullable: true },
													},
												},
											},
											roomStay: {
												type: 'object',
												nullable: true,
												additionalProperties: true,
												properties: {
													arrivalDate: { type: 'string', nullable: true },
													departureDate: { type: 'string', nullable: true },
													guarantee: {
														type: 'object',
														nullable: true,
														properties: {
															guaranteeCode: { type: 'string', nullable: true },
															shortDescription: { type: 'string', nullable: true },
														},
													},
													roomRates: {
														type: 'array',
														nullable: true,
														items: { type: 'object', additionalProperties: true },
													},
													guestCounts: {
														type: 'array',
														nullable: true,
														items: { type: 'object', additionalProperties: true },
													},
												},
											},
											reservationGuests: {
												type: 'array',
												nullable: true,
												items: {
													type: 'object',
													additionalProperties: true,
													properties: {
														profileInfo: {
															type: 'object',
															nullable: true,
															additionalProperties: true,
														},
														primary: { type: 'boolean', nullable: true },
													},
												},
											},
											hotelId: { type: 'string', nullable: true },
											reservationStatus: { type: 'string', nullable: true },
											createDateTime: { type: 'string', nullable: true },
										},
									},
								},
							},
						},
					},
				},
			},
		},
		handler: hotelReservationsController.getHotelReservations.bind(hotelReservationsController),
	});

	fastify.post('/api/hotels/:hotelId/reservations', {
		schema: {
			tags: ['hotel reservations'],
			description: 'Create a reservation',
			params: {
				type: 'object',
				required: ['hotelId'],
				properties: {
					hotelId: { type: 'string' },
				},
			},
			body: {
				type: 'object',
				additionalProperties: true,
			},
			response: {
				200: {
					type: 'object',
					properties: {
						reservations: {
							type: 'object',
							nullable: true,
							properties: {
								reservation: {
									type: 'array',
									nullable: true,
									items: {
										type: 'object',
										additionalProperties: true,
										properties: {
											reservationIdList: {
												type: 'array',
												nullable: true,
												items: {
													type: 'object',
													properties: {
														id: { type: 'string', nullable: true },
														type: { type: 'string', nullable: true },
													},
												},
											},
											roomStay: { type: 'object', nullable: true, additionalProperties: true },
											reservationGuests: {
												type: 'array',
												nullable: true,
												items: { type: 'object', additionalProperties: true },
											},
											hotelId: { type: 'string', nullable: true },
											reservationStatus: { type: 'string', nullable: true },
											createDateTime: { type: 'string', nullable: true },
										},
									},
								},
							},
						},
					},
				},
			},
		},
		handler: hotelReservationsController.createReservation.bind(hotelReservationsController),
	});

	fastify.get('/api/hotels/:hotelId/reservations/summary', {
		schema: {
			tags: ['hotel reservations'],
			description: 'Get reservations summary',
			params: {
				type: 'object',
				required: ['hotelId'],
				properties: {
					hotelId: { type: 'string' },
				},
			},
			querystring: {
				type: 'object',
				properties: {
					arrivalDate: { type: 'string', format: 'date', nullable: true },
					lastName: { type: 'string', nullable: true },
					limit: { type: 'integer', default: 200 },
					offset: { type: 'integer', default: 0 },
				},
			},
			response: {
				200: {
					type: 'object',
					properties: {
						reservations: {
							type: 'array',
							nullable: true,
							items: {
								type: 'object',
								additionalProperties: true,
								properties: {
									reservationId: { type: 'string', nullable: true },
									confirmationNumber: { type: 'string', nullable: true },
									guestName: { type: 'string', nullable: true },
									arrivalDate: { type: 'string', nullable: true },
									departureDate: { type: 'string', nullable: true },
									status: { type: 'string', nullable: true },
								},
							},
						},
					},
				},
			},
		},
		handler: hotelReservationsController.getReservationsSummary.bind(hotelReservationsController),
	});

	fastify.get('/api/hotels/:hotelId/reservations/statistics', {
		schema: {
			tags: ['hotel reservations'],
			description: 'Get reservation statistics',
			params: {
				type: 'object',
				required: ['hotelId'],
				properties: {
					hotelId: { type: 'string' },
				},
			},
			querystring: {
				type: 'object',
				properties: {
					startDate: { type: 'string', format: 'date', nullable: true },
					endDate: { type: 'string', format: 'date', nullable: true },
					limit: { type: 'integer', default: 20 },
					offset: { type: 'integer', default: 0 },
				},
			},
			response: {
				200: {
					type: 'object',
					properties: {
						checkReservations: {
							type: 'array',
							nullable: true,
							items: {
								type: 'object',
								additionalProperties: true,
								properties: {
									hotelId: { type: 'string', nullable: true },
									channelCode: { type: 'string', nullable: true },
									enterpriseId: { type: 'string', nullable: true },
									arrivalDate: { type: 'string', nullable: true },
									departureDate: { type: 'string', nullable: true },
									creationDate: { type: 'string', nullable: true },
									lastUpdateDate: { type: 'string', nullable: true },
									cancellationDate: { type: 'string', nullable: true },
									numberOfRooms: { type: 'integer', nullable: true },
									reservationStatus: { type: 'string', nullable: true },
									confirmationId: { type: 'string', nullable: true },
								},
							},
						},
						hasMore: { type: 'boolean', nullable: true },
					},
				},
			},
		},
		handler: hotelReservationsController.getReservationStatistics.bind(hotelReservationsController),
	});

	fastify.put('/api/hotels/:hotelId/reservations/:reservationId', {
		schema: {
			tags: ['hotel reservations'],
			description: 'Update a reservation',
			params: {
				type: 'object',
				required: ['hotelId', 'reservationId'],
				properties: {
					hotelId: { type: 'string' },
					reservationId: { type: 'string' },
				},
			},
			body: {
				type: 'object',
				additionalProperties: true,
			},
			response: {
				200: {
					type: 'object',
					properties: {
						reservations: {
							type: 'object',
							nullable: true,
							properties: {
								reservation: {
									type: 'array',
									nullable: true,
									items: {
										type: 'object',
										additionalProperties: true,
										properties: {
											reservationIdList: {
												type: 'array',
												nullable: true,
												items: {
													type: 'object',
													properties: {
														id: { type: 'string', nullable: true },
														type: { type: 'string', nullable: true },
													},
												},
											},
											roomStay: { type: 'object', nullable: true, additionalProperties: true },
											reservationGuests: {
												type: 'array',
												nullable: true,
												items: { type: 'object', additionalProperties: true },
											},
											hotelId: { type: 'string', nullable: true },
											reservationStatus: { type: 'string', nullable: true },
											createDateTime: { type: 'string', nullable: true },
										},
									},
								},
							},
						},
					},
				},
			},
		},
		handler: hotelReservationsController.updateReservation.bind(hotelReservationsController),
	});

	fastify.post('/api/hotels/:hotelId/reservations/:reservationId/cancellations', {
		schema: {
			tags: ['hotel reservations'],
			description: 'Cancel a reservation',
			params: {
				type: 'object',
				required: ['hotelId', 'reservationId'],
				properties: {
					hotelId: { type: 'string' },
					reservationId: { type: 'string' },
				},
			},
			body: {
				type: 'object',
				additionalProperties: true,
			},
			response: {
				201: {
					type: 'object',
					properties: {
						reservationIdList: {
							type: 'array',
							nullable: true,
							items: {
								type: 'object',
								properties: {
									id: { type: 'string', nullable: true },
									type: { type: 'string', nullable: true },
								},
							},
						},
						cancellationNumber: {
							type: 'object',
							nullable: true,
							properties: {
								id: { type: 'string', nullable: true },
								type: { type: 'string', nullable: true },
							},
						},
						status: { type: 'string', nullable: true },
					},
				},
			},
		},
		handler: hotelReservationsController.cancelReservation.bind(hotelReservationsController),
	});

	// Hotel Inventory endpoints
	fastify.get('/api/hotels/:hotelId/inventory/statistics', {
		schema: {
			tags: ['hotel inventory'],
			summary: 'Get Inventory Statistics',
			description:
				"Get a hotel's inventory statistics for a specified date range. This endpoint fetches inventory statistics based on the provided report code, which determines the type of statistics collected (e.g., DetailedAvailabilitySummary, RoomCalendarStatistics, SellLimitSummary, RoomsAvailabilitySummary).",
			params: {
				type: 'object',
				required: ['hotelId'],
				properties: {
					hotelId: {
						type: 'string',
						minLength: 1,
						maxLength: 2000,
						description: 'Unique ID of the hotel where inventory statistics are searched.',
					},
				},
			},
			querystring: {
				type: 'object',
				required: ['dateRangeStart', 'dateRangeEnd', 'reportCode'],
				properties: {
					dateRangeStart: {
						type: 'string',
						format: 'date',
						description: 'The starting value of the date range (YYYY-MM-DD format).',
					},
					dateRangeEnd: {
						type: 'string',
						format: 'date',
						description: 'The ending value of the date range (YYYY-MM-DD format).',
					},
					reportCode: {
						type: 'string',
						enum: [
							'DetailedAvailabiltySummary',
							'RoomCalendarStatistics',
							'SellLimitSummary',
							'RoomsAvailabilitySummary',
						],
						description:
							'Identifies the type of statistics collected. Each ReportCode corresponds to a set of category summaries based upon a predetermined agreement.',
					},
					parameterName: {
						type: 'array',
						items: { type: 'string' },
						nullable: true,
						description: 'Optional parameter names for filtering statistics.',
					},
					parameterValue: {
						type: 'array',
						items: { type: 'string' },
						nullable: true,
						description: 'Optional parameter values for filtering statistics.',
					},
				},
			},
			response: {
				200: {
					type: 'array',
					description: 'Array of inventory statistics for the requested hotel and date range.',
					items: {
						type: 'object',
						description: 'Defines all details needed to create a statistical report.',
						properties: {
							statistics: {
								type: 'array',
								nullable: true,
								description: 'Collection of statistic codes with their data.',
								items: {
									type: 'object',
									description: 'Defines the codes and corresponding categories.',
									properties: {
										statisticDate: {
											type: 'array',
											nullable: true,
											description: 'Collection of statistic summary data by date.',
											items: {
												type: 'object',
												description:
													'An instance of a statistic containing revenue and inventory summaries.',
												properties: {
													revenue: {
														type: 'array',
														nullable: true,
														description: 'Collection of revenue category summaries.',
														items: {
															type: 'object',
															properties: {
																categoryCode: { type: 'string', nullable: true },
																description: { type: 'string', nullable: true },
																amount: { type: 'number', nullable: true },
																currencyCode: { type: 'string', nullable: true },
															},
														},
													},
													inventory: {
														type: 'array',
														nullable: true,
														description: 'Collection of inventory/count category summaries.',
														items: {
															type: 'object',
															properties: {
																categoryCode: { type: 'string', nullable: true },
																description: { type: 'string', nullable: true },
																value: { type: 'number', nullable: true },
															},
														},
													},
													statisticDate: {
														type: 'string',
														nullable: true,
														description: 'Date of the statistic (YYYY-MM-DD format).',
													},
													weekendDate: {
														type: 'boolean',
														nullable: true,
														description: 'Whether this statistic date is a weekend date.',
													},
												},
											},
										},
										statCode: {
											type: 'string',
											nullable: true,
											description:
												'Actual code used by the system to collect statistics (e.g., CORP, RACK if category is Market Segment).',
										},
										statCategoryCode: {
											type: 'string',
											nullable: true,
											description: 'Category code of the stat code (e.g., Market Segment).',
										},
										statCodeClass: {
											type: 'string',
											nullable: true,
											description: 'Class grouping of the stat code.',
										},
										description: {
											type: 'string',
											nullable: true,
											description: 'Description of the statistic code.',
										},
									},
								},
							},
							hotelName: {
								type: 'string',
								nullable: true,
								description: 'A text field used to communicate the proper name of the hotel.',
							},
							reportCode: {
								type: 'string',
								nullable: true,
								description:
									'Identifies the type of statistics collected. Each ReportCode corresponds to a set of category summaries based upon a predetermined agreement.',
							},
							description: {
								type: 'string',
								nullable: true,
								description:
									'This element has revenue amount data for its revenue category such as Room Revenue, Food and Beverage Revenue.',
							},
						},
					},
				},
				400: {
					type: 'object',
					description: 'Validation error response.',
					properties: {
						error: { type: 'string', description: 'Error message.' },
						details: { type: 'array', description: 'Validation error details.' },
					},
				},
				422: {
					type: 'object',
					description: 'Unprocessable entity error from external provider.',
					properties: {
						error: { type: 'string' },
					},
				},
			},
		},
		handler: hotelInventoryController.getInventoryStatistics.bind(hotelInventoryController),
	});
}
