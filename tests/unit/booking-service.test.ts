import { BookingService } from '../../app/backend/src/application/services/booking-service';
import { BookingRepository } from '../../app/backend/src/domain/repositories/booking-repository';
import { Booking, BookingStatus, CreateBookingData } from '../../app/backend/src/domain/models/booking';

describe('BookingService', () => {
  let bookingService: BookingService;
  let mockRepository: jest.Mocked<BookingRepository>;

  beforeEach(() => {
    // Create mock repository
    mockRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    bookingService = new BookingService(mockRepository);
  });

  describe('createBooking', () => {
    it('should create a booking with valid data', async () => {
      const createData: CreateBookingData = {
        partnerId: '123e4567-e89b-12d3-a456-426614174000',
        customerName: 'John Doe',
        serviceType: 'Consultation',
        startDate: new Date('2024-01-01T10:00:00Z'),
        endDate: new Date('2024-01-01T11:00:00Z'),
      };

      const expectedBooking: Booking = {
        id: '123e4567-e89b-12d3-a456-426614174001',
        ...createData,
        status: BookingStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.create.mockResolvedValue(expectedBooking);

      const result = await bookingService.createBooking(createData);

      expect(mockRepository.create).toHaveBeenCalledWith(createData);
      expect(result).toEqual(expectedBooking);
    });

    it('should throw error if end date is before start date', async () => {
      const createData: CreateBookingData = {
        partnerId: '123e4567-e89b-12d3-a456-426614174000',
        customerName: 'John Doe',
        serviceType: 'Consultation',
        startDate: new Date('2024-01-01T11:00:00Z'),
        endDate: new Date('2024-01-01T10:00:00Z'),
      };

      await expect(bookingService.createBooking(createData)).rejects.toThrow(
        'End date must be after start date'
      );
      expect(mockRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('getBooking', () => {
    it('should return a booking by id', async () => {
      const booking: Booking = {
        id: '123e4567-e89b-12d3-a456-426614174001',
        partnerId: '123e4567-e89b-12d3-a456-426614174000',
        customerName: 'John Doe',
        serviceType: 'Consultation',
        startDate: new Date('2024-01-01T10:00:00Z'),
        endDate: new Date('2024-01-01T11:00:00Z'),
        status: BookingStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findById.mockResolvedValue(booking);

      const result = await bookingService.getBooking(booking.id);

      expect(mockRepository.findById).toHaveBeenCalledWith(booking.id);
      expect(result).toEqual(booking);
    });

    it('should return null if booking not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      const result = await bookingService.getBooking('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('getAllBookings', () => {
    it('should return all bookings', async () => {
      const bookings: Booking[] = [
        {
          id: '123e4567-e89b-12d3-a456-426614174001',
          partnerId: '123e4567-e89b-12d3-a456-426614174000',
          customerName: 'John Doe',
          serviceType: 'Consultation',
          startDate: new Date('2024-01-01T10:00:00Z'),
          endDate: new Date('2024-01-01T11:00:00Z'),
          status: BookingStatus.PENDING,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockRepository.findAll.mockResolvedValue(bookings);

      const result = await bookingService.getAllBookings();

      expect(mockRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual(bookings);
    });
  });

  describe('updateBooking', () => {
    it('should update a booking', async () => {
      const updatedBooking: Booking = {
        id: '123e4567-e89b-12d3-a456-426614174001',
        partnerId: '123e4567-e89b-12d3-a456-426614174000',
        customerName: 'Jane Doe',
        serviceType: 'Consultation',
        startDate: new Date('2024-01-01T10:00:00Z'),
        endDate: new Date('2024-01-01T11:00:00Z'),
        status: BookingStatus.CONFIRMED,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.update.mockResolvedValue(updatedBooking);

      const result = await bookingService.updateBooking(updatedBooking.id, {
        customerName: 'Jane Doe',
        status: BookingStatus.CONFIRMED,
      });

      expect(mockRepository.update).toHaveBeenCalled();
      expect(result).toEqual(updatedBooking);
    });
  });

  describe('deleteBooking', () => {
    it('should delete a booking', async () => {
      mockRepository.delete.mockResolvedValue(true);

      const result = await bookingService.deleteBooking('123e4567-e89b-12d3-a456-426614174001');

      expect(mockRepository.delete).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174001');
      expect(result).toBe(true);
    });

    it('should return false if booking not found', async () => {
      mockRepository.delete.mockResolvedValue(false);

      const result = await bookingService.deleteBooking('non-existent-id');

      expect(result).toBe(false);
    });
  });
});
