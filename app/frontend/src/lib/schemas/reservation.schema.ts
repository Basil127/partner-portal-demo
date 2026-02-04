import { z } from 'zod';

// Base schemas
export const personNameSchema = z.object({
	givenName: z.string().min(1, 'First name is required'),
	surname: z.string().min(1, 'Last name is required'),
	middleName: z.string().optional(),
	namePrefix: z.string().optional(),
	nameSuffix: z.string().optional(),
	isChild: z.boolean().default(false),
});

export const addressSchema = z.object({
	addressLine: z.array(z.string()).min(1, 'Address is required'),
	city: z.string().min(1, 'City is required'),
	postalCode: z.string().min(1, 'Postal code is required'),
	countryCode: z.string().min(2, 'Country code is required').max(2),
	state: z.string().optional(),
});

export const customerSchema = z.object({
	personName: z.array(personNameSchema).min(1, 'At least one guest is required'),
});

export const profileSchema = z.object({
	customer: customerSchema.optional(),
	profileType: z.string().default('GUEST'),
	email: z.string().email('Valid email is required').min(1, 'Email is required'),
	phoneNumber: z.string().min(1, 'Phone number is required'),
	address: addressSchema.optional(),
});

export const profileInfoSchema = z.object({
	profileIdList: z
		.array(
			z.object({
				id: z.string().optional(),
				type: z.string().optional(),
			}),
		)
		.optional(),
	profile: profileSchema.optional(),
});

export const reservationGuestSchema = z.object({
	profileInfo: profileInfoSchema.optional(),
	primary: z.boolean().default(true),
});

export const guestCountsSchema = z.object({
	adults: z.number().int().min(1, 'At least 1 adult is required'),
	children: z.number().int().min(0, 'Children count cannot be negative').default(0),
	childrenAges: z.array(z.number().int()).optional(),
});

export const paymentCardSchema = z.object({
	cardType: z.string().min(1, 'Card type is required'),
	cardNumber: z.string().min(1, 'Card number is required'),
	expireDate: z.string().min(1, 'Expiration date is required'),
	cardHolderName: z.string().min(1, 'Cardholder name is required'),
});

export const guaranteeSchema = z.object({
	guaranteeCode: z.string().default('CREDIT_CARD'),
	shortDescription: z.string().optional(),
	paymentCard: paymentCardSchema.optional(),
});

export const roomRateAmountSchema = z.object({
	amountBeforeTax: z.number().optional(),
	amountAfterTax: z.number().optional(),
	currencyCode: z.string().default('USD'),
});

export const roomRateSchema = z.object({
	start: z.string().optional(),
	end: z.string().optional(),
	roomType: z.string().optional(),
	ratePlanCode: z.string().optional(),
	total: roomRateAmountSchema.optional(),
});

export const roomStaySchema = z.object({
	arrivalDate: z.string().min(1, 'Check-in date is required'),
	departureDate: z.string().min(1, 'Check-out date is required'),
	guarantee: guaranteeSchema.optional(),
	roomRates: z.array(roomRateSchema).optional(),
	guestCounts: guestCountsSchema.optional(),
	roomType: z.string().min(1, 'Room type is required'),
	ratePlanCode: z.string().optional(),
	marketCode: z.string().optional(),
	sourceCode: z.string().optional(),
	total: roomRateAmountSchema.optional(),
});

export const reservationSchema = z.object({
	reservationIdList: z
		.array(
			z.object({
				id: z.string().optional(),
				type: z.string().optional(),
			}),
		)
		.optional(),
	roomStay: roomStaySchema.optional(),
	reservationGuests: z.array(reservationGuestSchema).optional(),
	hotelId: z.string().optional(),
	reservationStatus: z.string().optional(),
	createDateTime: z.string().optional(),
});

export const reservationCollectionSchema = z.object({
	reservation: z.array(reservationSchema).optional(),
});

export const createReservationSchema = z.object({
	reservations: reservationCollectionSchema,
});

// Form-specific schema (simplified for UI)
export const reservationFormSchema = z
	.object({
		// Guest Details
		primaryGuest: z.object({
			givenName: z.string().min(1, 'First name is required'),
			surname: z.string().min(1, 'Last name is required'),
			middleName: z.string().optional(),
		}),
		additionalGuests: z
			.array(
				z.object({
					givenName: z.string().min(1, 'First name is required'),
					surname: z.string().min(1, 'Last name is required'),
					middleName: z.string().optional(),
				}),
			)
			.default([]),

		// Contact Information
		email: z.string().email('Valid email is required').min(1, 'Email is required'),
		phoneNumber: z.string().min(1, 'Phone number is required'),
		address: z.string().min(1, 'Address is required'),
		city: z.string().min(1, 'City is required'),
		postalCode: z.string().min(1, 'Postal code is required'),
		countryCode: z.string().min(2, 'Country code is required').max(2).default('US'),
		state: z.string().optional(),

		// Booking Details (from context)
		arrivalDate: z.string().min(1, 'Check-in date is required'),
		departureDate: z.string().min(1, 'Check-out date is required'),
		adults: z.number().int().min(1, 'At least 1 adult is required'),
		children: z.number().int().min(0).default(0),

		// Hotel and Room Details (from query params or context)
		hotelId: z.string().min(1, 'Hotel ID is required'),
		roomType: z.string().optional(),
		ratePlanCode: z.string().optional(),

		// Payment (optional for now)
		guaranteeCode: z.string().default('CREDIT_CARD'),
		paymentCard: z
			.object({
				cardType: z.string().optional(),
				cardNumber: z.string().optional(),
				expireDate: z.string().optional(),
				cardHolderName: z.string().optional(),
			})
			.optional(),
	})
	.refine(
		(data) => {
			const arrival = new Date(data.arrivalDate);
			const departure = new Date(data.departureDate);
			return departure > arrival;
		},
		{
			message: 'Check-out date must be after check-in date',
			path: ['departureDate'],
		},
	);

// Export types
export type PersonNameFormData = z.infer<typeof personNameSchema>;
export type ReservationFormData = z.infer<typeof reservationFormSchema>;
export type CreateReservationData = z.infer<typeof createReservationSchema>;

// Helper function to transform form data to API request format
export function transformFormToApiRequest(formData: ReservationFormData): CreateReservationData {
	const personNames = [
		{
			givenName: formData.primaryGuest.givenName,
			surname: formData.primaryGuest.surname,
			middleName: formData.primaryGuest.middleName,
		},
		...formData.additionalGuests.map((guest) => ({
			givenName: guest.givenName,
			surname: guest.surname,
			middleName: guest.middleName,
		})),
	];

	return {
		reservations: {
			reservation: [
				{
					roomStay: {
						arrivalDate: formData.arrivalDate,
						departureDate: formData.departureDate,
						roomType: formData.roomType,
						ratePlanCode: formData.ratePlanCode,
						guestCounts: {
							adults: formData.adults,
							children: formData.children,
						},
						guarantee: formData.paymentCard
							? {
									guaranteeCode: formData.guaranteeCode,
									paymentCard: {
										cardType: formData.paymentCard.cardType,
										cardNumber: formData.paymentCard.cardNumber,
										expireDate: formData.paymentCard.expireDate,
										cardHolderName: formData.paymentCard.cardHolderName,
									},
								}
							: undefined,
					},
					reservationGuests: [
						{
							profileInfo: {
								profile: {
									customer: {
										personName: personNames,
									},
									profileType: 'GUEST',
									email: formData.email,
									phoneNumber: formData.phoneNumber,
									address: {
										addressLine: [formData.address],
										city: formData.city,
										postalCode: formData.postalCode,
										countryCode: formData.countryCode,
										state: formData.state,
									},
								},
							},
							primary: true,
						},
					],
					hotelId: formData.hotelId,
				},
			],
		},
	};
}
