import { BookingService } from '../application/services/booking-service.js';
import { ChatService } from '../application/services/chat-service.js';
import { HotelShopService } from '../application/services/hotel-shop/hotel-shop-service.js';
import { HotelContentService } from '../application/services/hotel-content/hotel-content-service.js';
import { HotelReservationsService } from '../application/services/hotel-reservations/hotel-reservations-service.js';
import { HotelInventoryService } from '../application/services/hotel-inventory/hotel-inventory-service.js';
import { BookingRepositoryImpl } from './repositories/booking-repository-impl.js';
import { ChatRepositoryImpl } from './repositories/chat-repository-impl.js';
import { HotelShopRepositoryImpl } from './repositories/hotel-shop/hotel-shop-repository-impl.js';
import { HotelContentRepositoryImpl } from './repositories/hotel-content/hotel-content-repository-impl.js';
import { HotelReservationsRepositoryImpl } from './repositories/hotel-reservations/hotel-reservations-repository-impl.js';
import { HotelInventoryRepositoryImpl } from './repositories/hotel-inventory/hotel-inventory-repository-impl.js';
import type { DatabaseAdapter } from './adapters/database.js';

export interface ServiceContainer {
	bookingService: BookingService;
	chatService: ChatService;
	hotelShopService: HotelShopService;
	hotelContentService: HotelContentService;
	hotelReservationsService: HotelReservationsService;
	hotelInventoryService: HotelInventoryService;
}

export function createServiceContainer(dbAdapter: DatabaseAdapter): ServiceContainer {
	const bookingRepository = new BookingRepositoryImpl(dbAdapter);
	const bookingService = new BookingService(bookingRepository);

	const chatRepository = new ChatRepositoryImpl(dbAdapter);
	const chatService = new ChatService(chatRepository);

	const hotelShopRepository = new HotelShopRepositoryImpl();
	const hotelShopService = new HotelShopService(hotelShopRepository);

	const hotelContentRepository = new HotelContentRepositoryImpl();
	const hotelContentService = new HotelContentService(hotelContentRepository);

	const hotelReservationsRepository = new HotelReservationsRepositoryImpl();
	const hotelReservationsService = new HotelReservationsService(hotelReservationsRepository);

	const hotelInventoryRepository = new HotelInventoryRepositoryImpl();
	const hotelInventoryService = new HotelInventoryService(hotelInventoryRepository);

	return {
		bookingService,
		chatService,
		hotelShopService,
		hotelContentService,
		hotelReservationsService,
		hotelInventoryService,
	};
}
