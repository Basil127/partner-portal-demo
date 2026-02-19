'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { ReservationModal } from '@/components/reservation/ReservationModal';
import GuestList from '@/components/reservation/GuestList';
import Button from '@/components/ui/button/Button';
import { useReservationForm } from '@/hooks/useReservationForm';
import {
	putApiHotelsByHotelIdReservationsByReservationId,
	getApiHotelsByHotelCodeOffer,
} from '@/lib/api-client/sdk.gen';
import { useToast } from '@/context/ToastContext';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import type { PersonName } from '@/components/reservation/GuestListItem';
import { EditReservationSummary } from '@/components/reservation/EditReservationSummary';
import { ReservationDetailsView } from '@/components/reservation/ReservationDetailsView';
import { PutApiHotelsByHotelIdReservationsByReservationIdData } from '@/lib/api-client/types.gen';

interface EditBookingModalProps {
	isOpen: boolean;
	onClose: () => void;
	/** The reservation object returned from the create_reservation tool result */
	reservation: any;
	hotelId: string;
}

function useDebounce<T>(value: T, delay: number): T {
	const [debouncedValue, setDebouncedValue] = useState<T>(value);
	useEffect(() => {
		const handler = setTimeout(() => setDebouncedValue(value), delay);
		return () => clearTimeout(handler);
	}, [value, delay]);
	return debouncedValue;
}

export default function EditBookingModal({
	isOpen,
	onClose,
	reservation,
	hotelId,
}: EditBookingModalProps) {
	const { success, error: showError } = useToast();
	const queryClient = useQueryClient();
	const form = useReservationForm();
	const [checkIn, setCheckIn] = useState('');
	const [checkOut, setCheckOut] = useState('');
	const [isEditMode, setIsEditMode] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);

	const nights = useMemo(() => {
		if (!checkIn || !checkOut) return 1;
		const start = new Date(checkIn);
		const end = new Date(checkOut);
		const nightCount = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
		return nightCount > 0 ? nightCount : 1;
	}, [checkIn, checkOut]);

	const guestCounts = useMemo(() => {
		let adults = 0;
		let children = 0;
		if (form.data.primaryGuest.isChild) children++; else adults++;
		form.data.additionalGuests.forEach((g) => { if (g.isChild) children++; else adults++; });
		return { adults, children };
	}, [form.data.primaryGuest, form.data.additionalGuests]);

	const debouncedCheckIn = useDebounce(checkIn, 1000);
	const debouncedCheckOut = useDebounce(checkOut, 1000);
	const debouncedGuestCounts = useDebounce(guestCounts, 1000);

	const { data: offerData, isLoading: isLoadingOffer } = useQuery({
		queryKey: ['chat-offer', hotelId, debouncedCheckIn, debouncedCheckOut, debouncedGuestCounts],
		queryFn: async () => {
			if (!isEditMode || !debouncedCheckIn || !debouncedCheckOut) return null;
			try {
				const response = await getApiHotelsByHotelCodeOffer({
					path: { hotelCode: hotelId },
					query: {
						arrivalDate: debouncedCheckIn,
						departureDate: debouncedCheckOut,
						adults: debouncedGuestCounts.adults,
						children: debouncedGuestCounts.children,
						roomType: reservation?.roomStay?.roomType,
						ratePlanCode: reservation?.roomStay?.ratePlanCode,
					},
				});
				return response.data;
			} catch {
				return null;
			}
		},
		enabled: isEditMode && !!debouncedCheckIn && !!debouncedCheckOut && isOpen,
		staleTime: 30000,
	});

	useEffect(() => {
		if (isOpen && reservation) {
			const guests = reservation.reservationGuests || [];
			const primaryGuestData = guests.find((g: any) => g.primary) || guests[0];
			const additionalGuests = guests.filter((g: any) => !g.primary);

			const profileInfo = (primaryGuestData?.profileInfo as any)?.profile;
			const personName = profileInfo?.customer?.personName?.[0];

			const primaryGuest: PersonName = {
				givenName: personName?.givenName || '',
				surname: personName?.surname || '',
				middleName: personName?.middleName || '',
				isChild: false,
			};

			const additionalGuestsData: PersonName[] = additionalGuests.map((g: any) => {
				const p = (g?.profileInfo as any)?.profile;
				const n = p?.customer?.personName?.[0];
				return { givenName: n?.givenName || '', surname: n?.surname || '', middleName: '', isChild: false };
			});

			form.initialize({
				primaryGuest,
				additionalGuests: additionalGuestsData,
				email: profileInfo?.email || '',
				phoneNumber: profileInfo?.phoneNumber || '',
				address: profileInfo?.address?.addressLine?.[0] || '',
				city: profileInfo?.address?.city || '',
				postalCode: profileInfo?.address?.postalCode || '',
				countryCode: profileInfo?.address?.countryCode || 'US',
				state: profileInfo?.address?.state || '',
			});

			setCheckIn(reservation.roomStay?.arrivalDate || '');
			setCheckOut(reservation.roomStay?.departureDate || '');
			setIsEditMode(false);
			setSubmitError(null);
		}
	}, [isOpen, reservation]);

	const updateMutation = useMutation({
		mutationFn: async (
			payload: Pick<PutApiHotelsByHotelIdReservationsByReservationIdData, 'body'>,
		) => {
			const confirmationId =
				reservation.reservationIdList?.find((id: any) => id.type === 'CONFIRMATION')?.id ||
				reservation.reservationIdList?.[0]?.id;
			return putApiHotelsByHotelIdReservationsByReservationId({
				path: { hotelId, reservationId: confirmationId },
				body: payload.body,
			});
		},
		onSuccess: () => {
			success('Reservation updated successfully!', 'Success');
			queryClient.invalidateQueries({ queryKey: ['reservations'] });
			onClose();
		},
		onError: (error: any) => {
			const msg = error.message || 'Failed to update reservation';
			setSubmitError(msg);
			showError(msg, 'Error');
		},
	});

	const handleSave = async () => {
		setSubmitError(null);
		const isValid = form.validate({
			checkIn,
			checkOut,
			adults: guestCounts.adults,
			children: guestCounts.children,
			hotelId,
			roomType: reservation?.roomStay?.roomType || '',
		});
		if (!isValid) {
			showError('Please fix the errors in the form before saving.', 'Validation Error');
			return;
		}

		const payload: Pick<PutApiHotelsByHotelIdReservationsByReservationIdData, 'body'> = {
			body: {
				reservations: {
					reservation: [
						{
							reservationIdList: reservation.reservationIdList,
							roomStay: {
								arrivalDate: checkIn,
								departureDate: checkOut,
								roomType: reservation?.roomStay?.roomType,
								ratePlanCode: reservation?.roomStay?.ratePlanCode,
								guestCounts,
							},
							reservationGuests: [
								{
									primary: true,
									profileInfo: {
										profile: {
											customer: {
												personName: [
													{
														givenName: form.data.primaryGuest.givenName,
														surname: form.data.primaryGuest.surname,
													},
												],
											},
											email: form.data.email,
										},
									},
								},
								...form.data.additionalGuests.map((guest) => ({
									primary: false,
									profileInfo: {
										profile: {
											customer: {
												personName: [
													{ givenName: guest.givenName, surname: guest.surname },
												],
											},
										},
									},
								})),
							],
							hotelId,
							reservationStatus: reservation.reservationStatus,
						},
					],
				},
			},
		};

		updateMutation.mutate(payload);
	};

	const modalHeader = (
		<div className="flex justify-between items-center pr-8">
			<h2 className="text-2xl font-bold text-gray-900 dark:text-white">
				{isEditMode ? 'Edit Booking' : 'Booking Details'}
			</h2>
			{!isEditMode && (
				<Button variant="primary" onClick={() => setIsEditMode(true)}>
					Edit
				</Button>
			)}
		</div>
	);

	const modalFooter = (
		<div className="flex flex-col w-full gap-3">
			{submitError && (
				<div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm w-full">
					{submitError}
				</div>
			)}
			<div className="flex justify-end gap-3 w-full">
				{isEditMode ? (
					<>
						<Button
							variant="outline"
							onClick={() => { setIsEditMode(false); setSubmitError(null); }}
							disabled={updateMutation.isPending}
						>
							Discard
						</Button>
						<Button
							variant="primary"
							onClick={handleSave}
							disabled={updateMutation.isPending}
						>
							{updateMutation.isPending ? 'Saving…' : 'Save Changes'}
						</Button>
					</>
				) : (
					<Button variant="outline" onClick={onClose}>
						Close
					</Button>
				)}
			</div>
		</div>
	);

	return (
		<ReservationModal
			isOpen={isOpen}
			onClose={onClose}
			size="xl"
			header={modalHeader}
			footer={modalFooter}
		>
			<div className="space-y-6">
				{isEditMode ? (
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
						checkIn={checkIn}
						checkOut={checkOut}
						onCheckInChange={setCheckIn}
						onCheckOutChange={setCheckOut}
					/>
				) : (
					<ReservationDetailsView
						reservation={reservation}
						formData={form.data}
						checkIn={checkIn}
						checkOut={checkOut}
					/>
				)}

				<EditReservationSummary
					checkIn={checkIn}
					checkOut={checkOut}
					nights={nights}
					guestCounts={guestCounts}
					roomType={reservation?.roomStay?.roomType}
					ratePlanCode={reservation?.roomStay?.ratePlanCode}
					pricing={offerData?.offer?.total}
					originalPricing={reservation?.roomStay?.total}
					isLoadingPricing={isLoadingOffer}
					isEditMode={isEditMode}
				/>
			</div>
		</ReservationModal>
	);
}
