import React from 'react';
import { ReservationFormData } from '@/hooks/useReservationForm';

interface ReservationDetailsViewProps {
	reservation: any;
	formData: ReservationFormData;
	checkIn: string;
	checkOut: string;
}

export const ReservationDetailsView: React.FC<ReservationDetailsViewProps> = ({
	reservation,
	formData,
	checkIn,
	checkOut,
}) => {
	return (
		<div className="space-y-4">
			<div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
				<div>
					<p className="text-sm text-gray-500 dark:text-gray-400">Confirmation Number</p>
					<p className="font-medium text-gray-900 dark:text-white">
						{reservation.reservationIdList?.find((id: any) => id.type === 'CONFIRMATION')?.id ||
							'N/A'}
					</p>
				</div>
				<div>
					<p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
					<p className="font-medium text-gray-900 dark:text-white">
						{reservation.reservationStatus}
					</p>
				</div>
				<div>
					<p className="text-sm text-gray-500 dark:text-gray-400">Check-In</p>
					<p className="font-medium text-gray-900 dark:text-white">{checkIn}</p>
				</div>
				<div>
					<p className="text-sm text-gray-500 dark:text-gray-400">Check-Out</p>
					<p className="font-medium text-gray-900 dark:text-white">{checkOut}</p>
				</div>
				<div>
					<p className="text-sm text-gray-500 dark:text-gray-400">Room Type</p>
					<p className="font-medium text-gray-900 dark:text-white">
						{reservation.roomStay?.roomType || 'N/A'}
					</p>
				</div>
				<div>
					<p className="text-sm text-gray-500 dark:text-gray-400">Guests</p>
					<p className="font-medium text-gray-900 dark:text-white">
						{reservation.reservationGuests?.length || 0}
					</p>
				</div>
			</div>

			<div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
				<h3 className="font-medium text-gray-900 dark:text-white mb-2">Guest Information</h3>
				<div className="space-y-2">
					{reservation.reservationGuests?.map((guest: any, idx: number) => {
						const profile = (guest.profileInfo as any)?.profile;
						const personName = profile?.customer?.personName?.[0];
						const name = `${personName?.givenName || ''} ${personName?.surname || ''}`.trim();
						return (
							<p key={idx} className="text-gray-700 dark:text-gray-300">
								{guest.primary ? '👤 ' : '  '}
								{name || 'Unknown Guest'}
							</p>
						);
					})}
				</div>
			</div>

			<div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
				<h3 className="font-medium text-gray-900 dark:text-white mb-2">Contact Information</h3>
				<div className="space-y-1">
					<p className="text-gray-700 dark:text-gray-300">Email: {formData.email || 'N/A'}</p>
					<p className="text-gray-700 dark:text-gray-300">Phone: {formData.phoneNumber || 'N/A'}</p>
					<p className="text-gray-700 dark:text-gray-300">
						Address:{' '}
						{formData.address
							? `${formData.address}, ${formData.city}, ${formData.state} ${formData.postalCode}, ${formData.countryCode}`
							: 'N/A'}
					</p>
				</div>
			</div>
		</div>
	);
};
