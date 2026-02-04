import React from 'react';
import ComponentCard from '../common/ComponentCard';
import Button from '../ui/button/Button';

interface ReservationSummaryProps {
	checkIn: string;
	checkOut: string;
	nights: number;
	adults: number;
	children: number;
	roomType: string;
	ratePlanCode?: string;
	error?: string | null;
	isLoading: boolean;
	onCancel: () => void;
	onSubmit: () => void;
	canSubmit: boolean;
}

export default function ReservationSummary({
	checkIn,
	checkOut,
	nights,
	adults,
	children,
	roomType,
	ratePlanCode,
	error,
	isLoading,
	onCancel,
	onSubmit,
	canSubmit,
}: ReservationSummaryProps) {
	return (
		<ComponentCard title="Reservation Summary">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div>
					<h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Check-in Date</h4>
					<p className="text-lg font-semibold text-gray-900 dark:text-white">{checkIn}</p>
				</div>
				<div>
					<h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Check-out Date</h4>
					<p className="text-lg font-semibold text-gray-900 dark:text-white">{checkOut}</p>
				</div>
				<div>
					<h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Number of Nights</h4>
					<p className="text-lg font-semibold text-gray-900 dark:text-white">{nights}</p>
				</div>
				<div>
					<h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Guests</h4>
					<p className="text-lg font-semibold text-gray-900 dark:text-white">
						{adults} Adult{adults !== 1 ? 's' : ''}
						{children > 0 ? `, ${children} Child${children !== 1 ? 'ren' : ''}` : ''}
					</p>
				</div>
				<div>
					<h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Room Type</h4>
					<p className="text-lg font-semibold text-gray-900 dark:text-white">
						{roomType || 'Not selected'}
					</p>
				</div>
				{ratePlanCode && (
					<div>
						<h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Rate Plan</h4>
						<p className="text-lg font-semibold text-gray-900 dark:text-white">{ratePlanCode}</p>
					</div>
				)}
			</div>

			{error && (
				<div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
					<p className="text-sm text-red-600 dark:text-red-400">{error}</p>
				</div>
			)}

			<div className="mt-6 flex justify-end gap-4">
				<Button variant="outline" onClick={onCancel} disabled={isLoading}>
					Cancel
				</Button>
				<Button variant="primary" onClick={onSubmit} disabled={isLoading || !canSubmit}>
					{isLoading ? 'Creating Reservation...' : 'Create Reservation'}
				</Button>
			</div>
		</ComponentCard>
	);
}
