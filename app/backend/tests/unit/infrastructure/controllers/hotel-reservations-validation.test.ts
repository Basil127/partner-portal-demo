import { describe, it, expect } from '@jest/globals';
import { z } from 'zod';

// Zod schemas for request validation (copied from controller for testing)
const UniqueIdSchema = z.object({
	id: z.string().optional().nullable(),
	type: z.string().optional().nullable(),
});

const PersonNameSchema = z.object({
	givenName: z.string().optional().nullable(),
	surname: z.string().optional().nullable(),
	namePrefix: z.string().optional().nullable(),
	middleName: z.string().optional().nullable(),
	nameSuffix: z.string().optional().nullable(),
});

const ProfileSchema = z.object({
	customer: z
		.object({
			personName: z.array(PersonNameSchema).optional().nullable(),
		})
		.optional()
		.nullable(),
	email: z.string().email().optional().nullable(),
	phoneNumber: z.string().optional().nullable(),
	address: z
		.object({
			addressLine: z.array(z.string()).optional().nullable(),
			city: z.string().optional().nullable(),
			postalCode: z.string().optional().nullable(),
			countryCode: z.string().optional().nullable(),
			state: z.string().optional().nullable(),
		})
		.optional()
		.nullable(),
});

const ProfileInfoSchema = z.object({
	profileIdList: z.array(UniqueIdSchema).optional().nullable(),
	profile: ProfileSchema.optional().nullable(),
});

const ReservationGuestSchema = z.object({
	profileInfo: ProfileInfoSchema.optional().nullable(),
	primary: z.boolean().optional().nullable().default(true),
});

const GuestCountsSchema = z.object({
	adults: z.number().int().min(1).optional().nullable(),
	children: z.number().int().min(0).optional().nullable(),
	childrenAges: z.array(z.number().int()).optional().nullable(),
});

const RateTotalSchema = z.object({
	amountBeforeTax: z.number().optional().nullable(),
	amountAfterTax: z.number().optional().nullable(),
	currencyCode: z.string().optional().nullable(),
});

const RateSchema = z.object({
	base: z.number().optional().nullable(),
	amountBeforeTax: z.number().optional().nullable(),
	amountAfterTax: z.number().optional().nullable(),
	currencyCode: z.string().optional().nullable(),
	effectiveDate: z.string().optional().nullable(),
});

const RatesByDateSchema = z.object({
	rate: z.array(RateSchema).optional().nullable(),
});

const GuaranteeSchema = z.object({
	guaranteeCode: z.string().optional().nullable(),
	shortDescription: z.string().optional().nullable(),
	paymentCard: z
		.object({
			cardType: z.string().optional().nullable(),
			cardNumber: z.string().optional().nullable(),
			expireDate: z.string().optional().nullable(),
			cardHolderName: z.string().optional().nullable(),
		})
		.optional()
		.nullable(),
});

const RoomRateSchema = z.object({
	total: RateTotalSchema.optional().nullable(),
	rates: RatesByDateSchema.optional().nullable(),
	roomType: z.string().optional().nullable(),
	ratePlanCode: z.string().optional().nullable(),
	start: z.string().optional().nullable(),
	end: z.string().optional().nullable(),
	guestCounts: GuestCountsSchema.optional().nullable(),
});

const RoomStaySchema = z.object({
	arrivalDate: z.string().optional().nullable(),
	departureDate: z.string().optional().nullable(),
	guarantee: GuaranteeSchema.optional().nullable(),
	roomRates: z.array(RoomRateSchema).optional().nullable(),
	guestCounts: GuestCountsSchema.optional().nullable(),
	roomType: z.string().optional().nullable(),
	ratePlanCode: z.string().optional().nullable(),
	marketCode: z.string().optional().nullable(),
	sourceCode: z.string().optional().nullable(),
	total: RateTotalSchema.optional().nullable(),
});

const ReservationSchema = z.object({
	reservationIdList: z.array(UniqueIdSchema).optional().nullable(),
	roomStay: RoomStaySchema.optional().nullable(),
	reservationGuests: z.array(ReservationGuestSchema).optional().nullable(),
	hotelId: z.string().optional().nullable(),
	reservationStatus: z.string().optional().nullable(),
	createDateTime: z.string().optional().nullable(),
});

const ReservationCollectionSchema = z.object({
	reservation: z.array(ReservationSchema).optional().nullable(),
});

const CreateReservationRequestSchema = z.object({
	reservations: ReservationCollectionSchema,
});

describe('Hotel Reservations Validation', () => {
	describe('CreateReservationRequestSchema', () => {
		it('should validate a complete reservation request', () => {
			const validRequest = {
				reservations: {
					reservation: [
						{
							roomStay: {
								arrivalDate: '2024-03-15',
								departureDate: '2024-03-17',
								roomType: 'DELUXE',
								ratePlanCode: 'BAR',
								guestCounts: {
									adults: 2,
									children: 0,
								},
								guarantee: {
									guaranteeCode: 'CREDIT_CARD',
									shortDescription: 'Credit Card Guarantee',
									paymentCard: {
										cardType: 'VISA',
										cardNumber: '****1234',
										expireDate: '12/25',
										cardHolderName: 'John Doe',
									},
								},
								roomRates: [
									{
										roomType: 'DELUXE',
										ratePlanCode: 'BAR',
										start: '2024-03-15',
										end: '2024-03-17',
										total: {
											amountBeforeTax: 200.0,
											amountAfterTax: 230.0,
											currencyCode: 'USD',
										},
										guestCounts: {
											adults: 2,
											children: 0,
										},
									},
								],
							},
							reservationGuests: [
								{
									primary: true,
									profileInfo: {
										profile: {
											customer: {
												personName: [
													{
														givenName: 'John',
														surname: 'Doe',
														namePrefix: 'Mr.',
													},
												],
											},
											email: 'john.doe@example.com',
											phoneNumber: '+1-555-1234',
											address: {
												addressLine: ['123 Main St'],
												city: 'New York',
												state: 'NY',
												postalCode: '10001',
												countryCode: 'US',
											},
										},
									},
								},
							],
							hotelId: 'HOTEL123',
							reservationStatus: 'RESERVED',
						},
					],
				},
			};

			const result = CreateReservationRequestSchema.safeParse(validRequest);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.reservations.reservation).toHaveLength(1);
			}
		});

		it('should validate a minimal reservation request', () => {
			const minimalRequest = {
				reservations: {
					reservation: [
						{
							roomStay: {
								arrivalDate: '2024-03-15',
								departureDate: '2024-03-17',
							},
						},
					],
				},
			};

			const result = CreateReservationRequestSchema.safeParse(minimalRequest);
			expect(result.success).toBe(true);
		});

		it('should fail validation when reservations is missing', () => {
			const invalidRequest = {};

			const result = CreateReservationRequestSchema.safeParse(invalidRequest);
			expect(result.success).toBe(false);
		});

		it('should validate guest counts with correct values', () => {
			const request = {
				reservations: {
					reservation: [
						{
							roomStay: {
								guestCounts: {
									adults: 2,
									children: 1,
								},
							},
						},
					],
				},
			};

			const result = CreateReservationRequestSchema.safeParse(request);
			expect(result.success).toBe(true);
		});

		it('should fail validation when adults count is less than 1', () => {
			const request = {
				reservations: {
					reservation: [
						{
							roomStay: {
								guestCounts: {
									adults: 0,
									children: 0,
								},
							},
						},
					],
				},
			};

			const result = CreateReservationRequestSchema.safeParse(request);
			expect(result.success).toBe(false);
		});

		it('should fail validation when email format is invalid', () => {
			const request = {
				reservations: {
					reservation: [
						{
							reservationGuests: [
								{
									profileInfo: {
										profile: {
											email: 'not-an-email',
										},
									},
								},
							],
						},
					],
				},
			};

			const result = CreateReservationRequestSchema.safeParse(request);
			expect(result.success).toBe(false);
		});

		it('should validate null values for optional fields', () => {
			const request = {
				reservations: {
					reservation: [
						{
							roomStay: {
								arrivalDate: '2024-03-15',
								departureDate: null,
								roomType: null,
								guarantee: null,
							},
						},
					],
				},
			};

			const result = CreateReservationRequestSchema.safeParse(request);
			expect(result.success).toBe(true);
		});

		it('should set default value for primary guest flag', () => {
			const request = {
				reservations: {
					reservation: [
						{
							reservationGuests: [
								{
									profileInfo: {
										profile: {
											email: 'test@example.com',
										},
									},
								},
							],
						},
					],
				},
			};

			const result = CreateReservationRequestSchema.safeParse(request);
			expect(result.success).toBe(true);
			if (result.success) {
				const guest = result.data.reservations.reservation?.[0]?.reservationGuests?.[0];
				expect(guest?.primary).toBe(true);
			}
		});

		it('should validate multiple guests in a reservation', () => {
			const request = {
				reservations: {
					reservation: [
						{
							reservationGuests: [
								{
									primary: true,
									profileInfo: {
										profile: {
											customer: {
												personName: [
													{
														givenName: 'John',
														surname: 'Doe',
													},
												],
											},
											email: 'john@example.com',
										},
									},
								},
								{
									primary: false,
									profileInfo: {
										profile: {
											customer: {
												personName: [
													{
														givenName: 'Jane',
														surname: 'Doe',
													},
												],
											},
											email: 'jane@example.com',
										},
									},
								},
							],
						},
					],
				},
			};

			const result = CreateReservationRequestSchema.safeParse(request);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.reservations.reservation?.[0]?.reservationGuests).toHaveLength(2);
			}
		});

		it('should validate room rates with date ranges', () => {
			const request = {
				reservations: {
					reservation: [
						{
							roomStay: {
								roomRates: [
									{
										start: '2024-03-15',
										end: '2024-03-16',
										total: {
											amountBeforeTax: 100.0,
											amountAfterTax: 115.0,
											currencyCode: 'USD',
										},
									},
									{
										start: '2024-03-16',
										end: '2024-03-17',
										total: {
											amountBeforeTax: 120.0,
											amountAfterTax: 138.0,
											currencyCode: 'USD',
										},
									},
								],
							},
						},
					],
				},
			};

			const result = CreateReservationRequestSchema.safeParse(request);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.reservations.reservation?.[0]?.roomStay?.roomRates).toHaveLength(2);
			}
		});
	});
});
