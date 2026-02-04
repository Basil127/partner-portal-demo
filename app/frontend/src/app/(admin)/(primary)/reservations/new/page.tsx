'use client';
import { useBooking } from '@/context/BookingContext';
import React, { useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import GuestList from '@/components/reservation/GuestList';
import ReservationSummary from '@/components/reservation/ReservationSummary';
import { useCreateReservation } from '@/hooks/useCreateReservation';
import { useReservationForm } from '@/hooks/useReservationForm';
import type { ReservationFormData } from '@/lib/schemas/reservation.schema';
import { useToast } from '@/context/ToastContext';

export default function NewReservationPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { checkIn, checkOut, adults, children, calculateNights } = useBooking();
	const { success, error: showError } = useToast();

	// Get hotel and room info from query params
	const hotelId = searchParams.get('hotelId') || '';
	const roomId = searchParams.get('roomId') || '';

	// Form state and logic
	const form = useReservationForm();

	useEffect(() => {
		for (let i = 1; i < adults; i++) {
			form.addGuest();
		}
		for (let i = 0; i < children; i++) {
			form.addGuest();
		}
	}, []);

	// Hook for creating reservation
	const { createReservation, isLoading } = useCreateReservation({
		onSuccess: () => {
			success('Reservation created successfully!', 'Success');
			router.push('/reservations');
		},
		onError: (error) => {
			showError(`Reservation creation failed: ${error.message}`, 'Error');
		},
	});

	const nights = useMemo(() => calculateNights(), [calculateNights]);

	// Validation check on mount for required query params
	useEffect(() => {
		if (!hotelId || !roomId) {
			console.warn('Missing required parameters: hotelId or roomType');
			showError('Missing required parameters: hotelId or roomType', 'Error');
		}
	}, [hotelId, roomId, showError]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const isValid = form.validate({
			checkIn,
			checkOut,
			adults,
			children,
			hotelId,
			roomType: roomId,
		});

		if (!isValid) {
			showError('Please fix the errors in the form before submitting.', 'Validation Error');
			return;
		}

		const formData: ReservationFormData = {
			primaryGuest: form.data.primaryGuest,
			additionalGuests: form.data.additionalGuests,
			email: form.data.email,
			phoneNumber: form.data.phoneNumber,
			address: form.data.address,
			city: form.data.city,
			postalCode: form.data.postalCode,
			countryCode: form.data.countryCode,
			state: form.data.state,
			arrivalDate: checkIn,
			departureDate: checkOut,
			adults,
			children,
			hotelId,
			roomType: roomId,
			guaranteeCode: 'CREDIT_CARD',
		};

		try {
			await createReservation(hotelId, formData);
		} catch (err) {
			showError(`${(err as Error).message}`, 'Error');
		}
	};

	return (
		<>
			<form onSubmit={handleSubmit} className="space-y-6">
				<GuestList
					data={form.data}
					onChange={{
						onPrimaryGuestChange: form.updatePrimaryGuest,
						onAdditionalGuestChange: form.updateAdditionalGuest,
						onAddGuest: form.addGuest,
						onRemoveGuest: form.removeGuest,
						onFieldChange: form.updateField,
					}}
					errors={form.errors}
				/>

				<ReservationSummary
					checkIn={checkIn}
					checkOut={checkOut}
					nights={nights}
					adults={form.data.additionalGuests.filter((g) => !g.isChild).length + 1}
					children={form.data.additionalGuests.filter((g) => g.isChild).length}
					roomType={roomId}
					isLoading={isLoading}
					onCancel={() => router.back()}
					onSubmit={() => {}}
					canSubmit={!!hotelId && !!roomId}
				/>
			</form>
		</>
	);
}
