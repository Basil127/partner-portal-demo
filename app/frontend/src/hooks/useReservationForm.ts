import { useState, useCallback } from 'react';
import type { PersonName } from '@/components/reservation/GuestListItem';
import type { ReservationFormData as ApiReservationFormData } from '@/lib/schemas/reservation.schema';
import {
	validateReservationForm,
	formatErrorsForGuestList,
	type ValidationErrors,
} from '@/lib/validation/validateReservationForm';

export interface ReservationFormData {
	primaryGuest: PersonName;
	additionalGuests: PersonName[];
	email: string;
	phoneNumber: string;
	address: string;
	city: string;
	postalCode: string;
	countryCode: string;
	state: string;
}

export interface UseReservationFormReturn {
	data: ReservationFormData;
	errors: ValidationErrors;
	updateField: <K extends keyof ReservationFormData>(
		field: K,
		value: ReservationFormData[K],
	) => void;
	updatePrimaryGuest: (guest: PersonName) => void;
	updateAdditionalGuest: (index: number, guest: PersonName) => void;
	addGuest: () => void;
	removeGuest: (index: number) => void;
	validate: (bookingData: {
		checkIn: string;
		checkOut: string;
		adults: number;
		children: number;
		hotelId: string;
		roomType: string;
		ratePlanCode?: string;
	}) => boolean;
	reset: () => void;
	initialize: (data: ReservationFormData) => void;
}

const initialFormData: ReservationFormData = {
	primaryGuest: {
		givenName: '',
		surname: '',
		middleName: '',
		isChild: false,
	},
	additionalGuests: [],
	email: '',
	phoneNumber: '',
	address: '',
	city: '',
	postalCode: '',
	countryCode: 'US',
	state: '',
};

export function useReservationForm(): UseReservationFormReturn {
	const [data, setData] = useState<ReservationFormData>(initialFormData);
	const [errors, setErrors] = useState<ValidationErrors>({});

	const updateField = useCallback(
		<K extends keyof ReservationFormData>(field: K, value: ReservationFormData[K]) => {
			setData((prev) => ({ ...prev, [field]: value }));
		},
		[],
	);

	const updatePrimaryGuest = useCallback((guest: PersonName) => {
		setData((prev) => ({ ...prev, primaryGuest: guest }));
	}, []);

	const updateAdditionalGuest = useCallback((index: number, guest: PersonName) => {
		setData((prev) => {
			const updated = [...prev.additionalGuests];
			updated[index] = guest;
			return { ...prev, additionalGuests: updated };
		});
	}, []);

	const addGuest = useCallback(() => {
		setData((prev) => ({
			...prev,
			additionalGuests: [
				...prev.additionalGuests,
				{ givenName: '', surname: '', middleName: '', isChild: false },
			],
		}));
	}, []);

	const removeGuest = useCallback((index: number) => {
		setData((prev) => ({
			...prev,
			additionalGuests: prev.additionalGuests.filter((_, i) => i !== index),
		}));
	}, []);

	const validate = useCallback(
		(bookingData: {
			checkIn: string;
			checkOut: string;
			adults: number;
			children: number;
			hotelId: string;
			roomType: string;
			ratePlanCode?: string;
		}) => {
			const formData: ApiReservationFormData = {
				primaryGuest: data.primaryGuest,
				additionalGuests: data.additionalGuests,
				email: data.email,
				phoneNumber: data.phoneNumber,
				address: data.address,
				city: data.city,
				postalCode: data.postalCode,
				countryCode: data.countryCode,
				state: data.state,
				arrivalDate: bookingData.checkIn,
				departureDate: bookingData.checkOut,
				adults: bookingData.adults,
				children: bookingData.children,
				hotelId: bookingData.hotelId,
				roomType: bookingData.roomType,
				ratePlanCode: bookingData.ratePlanCode,
				guaranteeCode: 'CREDIT_CARD',
			};

			const { isValid, errors: validationErrors } = validateReservationForm(formData);
			const formattedErrors = formatErrorsForGuestList(
				validationErrors,
				data.additionalGuests.length,
			);
			setErrors(formattedErrors);

			return isValid;
		},
		[data],
	);

	const reset = useCallback(() => {
		setData(initialFormData);
		setErrors({});
	}, []);

	const initialize = useCallback((newData: ReservationFormData) => {
		setData(newData);
		setErrors({});
	}, []);

	return {
		data,
		errors,
		updateField,
		updatePrimaryGuest,
		updateAdditionalGuest,
		addGuest,
		removeGuest,
		validate,
		reset,
		initialize,
	};
}
