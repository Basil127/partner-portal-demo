import { z } from 'zod';
import { reservationFormSchema, type ReservationFormData } from '../schemas/reservation.schema';

export interface ValidationErrors {
	primaryGuest?: {
		givenName?: string;
		surname?: string;
		middleName?: string;
	};
	additionalGuests?: Array<{
		givenName?: string;
		surname?: string;
		middleName?: string;
	}>;
	email?: string;
	phoneNumber?: string;
	address?: string;
	city?: string;
	postalCode?: string;
	countryCode?: string;
	state?: string;
	checkIn?: string;
	checkOut?: string;
	[key: string]: any;
}

export function validateReservationForm(formData: ReservationFormData): {
	isValid: boolean;
	errors: ValidationErrors;
} {
	try {
		reservationFormSchema.parse(formData);
		return { isValid: true, errors: {} };
	} catch (err) {
		if (err instanceof z.ZodError) {
			const formattedErrors: Record<string, any> = {};
			err.issues.forEach((issue) => {
				const path = issue.path.join('.');
				formattedErrors[path] = issue.message;
			});

			return {
				isValid: false,
				errors: formattedErrors,
			};
		}
		return { isValid: false, errors: {} };
	}
}

export function formatErrorsForGuestList(
	errors: Record<string, any>,
	additionalGuestsCount: number,
): ValidationErrors {
	return {
		primaryGuest: {
			givenName: errors['primaryGuest.givenName'],
			surname: errors['primaryGuest.surname'],
			middleName: errors['primaryGuest.middleName'],
		},
		additionalGuests: Array.from({ length: additionalGuestsCount }, (_, index) => ({
			givenName: errors[`additionalGuests.${index}.givenName`],
			surname: errors[`additionalGuests.${index}.surname`],
			middleName: errors[`additionalGuests.${index}.middleName`],
		})),
		email: errors.email,
		phoneNumber: errors.phoneNumber,
		address: errors.address,
		city: errors.city,
		postalCode: errors.postalCode,
		countryCode: errors.countryCode,
		state: errors.state,
		checkIn: errors.arrivalDate,
		checkOut: errors.departureDate,
	};
}
