'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { ReservationModal } from './ReservationModal';
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
import { EditReservationSummary } from './EditReservationSummary';
import { ReservationDetailsView } from './ReservationDetailsView';
import { PutApiHotelsByHotelIdReservationsByReservationIdData } from '@/lib/api-client/types.gen';

interface EditReservationModalProps {
	isOpen: boolean;
	onClose: () => void;
	reservation: any;
	hotelId: string;
}

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
	const [debouncedValue, setDebouncedValue] = useState<T>(value);

	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedValue(value);
		}, delay);

		return () => {
			clearTimeout(handler);
		};
	}, [value, delay]);

	return debouncedValue;
}

export default function EditReservationModal({
	isOpen,
	onClose,
	reservation,
	hotelId,
}: EditReservationModalProps) {
	const { success, error: showError } = useToast();
	const queryClient = useQueryClient();
	const form = useReservationForm();
	const [checkIn, setCheckIn] = useState('');
	const [checkOut, setCheckOut] = useState('');
	const [isEditMode, setIsEditMode] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);

	// Calculate number of nights
	const nights = useMemo(() => {
		if (!checkIn || !checkOut) return 1;
		const start = new Date(checkIn);
		const end = new Date(checkOut);
		const nightCount = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
		return nightCount > 0 ? nightCount : 1;
	}, [checkIn, checkOut]);

	// Calculate actual guest counts from form data
	const guestCounts = useMemo(() => {
		let adults = 0;
		let children = 0;

		// Check primary guest
		if (form.data.primaryGuest.isChild) {
			children++;
		} else {
			adults++;
		}

		// Check additional guests
		form.data.additionalGuests.forEach((guest) => {
			if (guest.isChild) {
				children++;
			} else {
				adults++;
			}
		});

		return { adults, children };
	}, [form.data.primaryGuest, form.data.additionalGuests]);

	// Debounce the dates and guest counts for API calls (1 second delay)
	const debouncedCheckIn = useDebounce(checkIn, 1000);
	const debouncedCheckOut = useDebounce(checkOut, 1000);
	const debouncedGuestCounts = useDebounce(guestCounts, 1000);

	// Fetch updated pricing when dates or guest count change in edit mode
	const { data: offerData, isLoading: isLoadingOffer } = useQuery({
		queryKey: ['offer', hotelId, debouncedCheckIn, debouncedCheckOut, debouncedGuestCounts],
		queryFn: async () => {
			if (!isEditMode || !debouncedCheckIn || !debouncedCheckOut) return null;

			try {
				const response = await getApiHotelsByHotelCodeOffer({
					path: {
						hotelCode: hotelId,
					},
					query: {
						arrivalDate: debouncedCheckIn,
						departureDate: debouncedCheckOut,
						adults: debouncedGuestCounts.adults,
						children: debouncedGuestCounts.children,
						roomType: reservation.roomStay?.roomType,
						ratePlanCode: reservation.roomStay?.ratePlanCode,
					},
				});
				return response.data;
			} catch (error) {
				console.error('Failed to fetch offer:', error);
				return null;
			}
		},
		enabled: isEditMode && !!debouncedCheckIn && !!debouncedCheckOut && isOpen,
		staleTime: 30000, // Cache for 30 seconds
	});

	// Map API reservation to form data on mount/change
	useEffect(() => {
		if (isOpen && reservation) {
			const guests = reservation.reservationGuests || [];
			const primaryGuestData = guests.find((g: any) => g.primary) || guests[0];
			const additionalGuests = guests.filter((g: any) => !g.primary);

			// Extract primary guest info
			const profileInfo = (primaryGuestData?.profileInfo as any)?.profile;
			const personName = profileInfo?.customer?.personName?.[0];

			// Assume guest is adult if not specified, since API doesn't seem to track age/child status per guest explicitly in GET
			const primaryGuest: PersonName = {
				givenName: personName?.givenName || '',
				surname: personName?.surname || '',
				middleName: personName?.middleName || '',
				isChild: false,
			};

			// Extract additional guests
			const additionalGuestsData: PersonName[] = additionalGuests.map((g: any) => {
				const guestProfileInfo = (g?.profileInfo as any)?.profile;
				const guestPersonName = guestProfileInfo?.customer?.personName?.[0];
				return {
					givenName: guestPersonName?.givenName || '',
					surname: guestPersonName?.surname || '',
					middleName: guestPersonName?.middleName || '',
					isChild: false,
				};
			});

			// Extract contact info from primary guest profile
			const email = profileInfo?.email || '';
			const phoneNumber = profileInfo?.phoneNumber || '';
			const address = profileInfo?.address?.addressLine?.[0] || '';
			const city = profileInfo?.address?.city || '';
			const postalCode = profileInfo?.address?.postalCode || '';
			const countryCode = profileInfo?.address?.countryCode || 'US';
			const state = profileInfo?.address?.state || '';

			// Initialize form
			form.initialize({
				primaryGuest,
				additionalGuests: additionalGuestsData,
				email,
				phoneNumber,
				address,
				city,
				postalCode,
				countryCode,
				state,
			});

			// Set dates
			setCheckIn(reservation.roomStay?.arrivalDate || '');
			setCheckOut(reservation.roomStay?.departureDate || '');
			setIsEditMode(false);
			setSubmitError(null);
		}
	}, [isOpen, reservation]);

	// Mutation for updating reservation
	const updateMutation = useMutation({
		mutationFn: async (payload: PutApiHotelsByHotelIdReservationsByReservationIdData) => {
			const confirmationId =
				reservation.reservationIdList?.find((id: any) => id.type === 'CONFIRMATION')?.id ||
				reservation.reservationIdList?.[0]?.id;

			return putApiHotelsByHotelIdReservationsByReservationId({
				path: {
					hotelId,
					reservationId: confirmationId,
				},
				body: payload.body,
			});
		},
		onSuccess: () => {
			success('Reservation updated successfully!', 'Success');
			queryClient.invalidateQueries({ queryKey: ['reservations'] });
			onClose();
		},
		onError: (error: any) => {
			const errorMessage = error.message || 'Failed to update reservation';
			setSubmitError(errorMessage);
			showError(errorMessage, 'Error');
		},
	});

	const handleSave = async () => {
		setSubmitError(null);

		// Validate form
		const isValid = form.validate({
			checkIn,
			checkOut,
			adults: guestCounts.adults,
			children: guestCounts.children,
			hotelId,
			roomType: reservation.roomStay?.roomType || '',
		});

		if (!isValid) {
			showError('Please fix the errors in the form before saving.', 'Validation Error');
			// Form errors are now in form.errors, pass them to GuestList
			return;
		}

		// Build update payload - Strict adherence to generated types
		// Note: Middle name, phone number, and address are omitted as they are not present in the
		// PutApiHotelsByHotelIdReservationsByReservationIdData type definition.
		const payload: PutApiHotelsByHotelIdReservationsByReservationIdData = {
			body: {
				reservations: {
					reservation: [
						{
							reservationIdList: reservation.reservationIdList,
							roomStay: {
								arrivalDate: checkIn,
								departureDate: checkOut,
								roomType: reservation.roomStay?.roomType,
								ratePlanCode: reservation.roomStay?.ratePlanCode,
								guestCounts: guestCounts,
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
														// middleName is excluded as it's not in the type def
													},
												],
											},
											email: form.data.email,
											// phoneNumber and address are excluded as they are not in the type def
										},
									},
								},
								...form.data.additionalGuests.map((guest) => ({
									primary: false,
									profileInfo: {
										profile: {
											customer: {
												personName: [
													{
														givenName: guest.givenName,
														surname: guest.surname,
														// middleName is excluded
													},
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

	const handleDiscard = () => {
		setIsEditMode(false);
		setSubmitError(null);
	};

	// Modal header
	const modalHeader = (
		<div className="flex justify-between items-center pr-8">
			<h2 className="text-2xl font-bold text-gray-900 dark:text-white">
				{isEditMode ? 'Edit Reservation' : 'Reservation Details'}
			</h2>
			{!isEditMode && (
				<Button variant="primary" onClick={() => setIsEditMode(true)}>
					Edit
				</Button>
			)}
		</div>
	);

	// Modal footer
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
						<Button variant="outline" onClick={handleDiscard} disabled={updateMutation.isPending}>
							Discard
						</Button>
						<Button variant="primary" onClick={handleSave} disabled={updateMutation.isPending}>
							{updateMutation.isPending ? 'Saving...' : 'Save Changes'}
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
				{/* Display current data in view mode, editable form in edit mode */}
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

				{/* Reservation Summary */}
				<EditReservationSummary
					checkIn={checkIn}
					checkOut={checkOut}
					nights={nights}
					guestCounts={guestCounts}
					roomType={reservation.roomStay?.roomType}
					ratePlanCode={reservation.roomStay?.ratePlanCode}
					pricing={offerData?.offer?.total}
					originalPricing={reservation.roomStay?.total}
					isLoadingPricing={isLoadingOffer}
					isEditMode={isEditMode}
				/>
			</div>
		</ReservationModal>
	);
}
