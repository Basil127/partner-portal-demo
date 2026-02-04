import React, { useMemo } from 'react';

interface EditReservationSummaryProps {
	checkIn: string;
	checkOut: string;
	nights: number;
	guestCounts: {
		adults: number;
		children: number;
	};
	roomType: string;
	ratePlanCode: string;
	pricing:
		| {
				amountBeforeTax?: number;
				amountAfterTax?: number;
				currencyCode?: string;
		  }
		| undefined;
	originalPricing:
		| {
				amountBeforeTax?: number;
				amountAfterTax?: number;
				currencyCode?: string;
		  }
		| undefined;
	isLoadingPricing: boolean;
	isEditMode: boolean;
}

export const EditReservationSummary: React.FC<EditReservationSummaryProps> = ({
	checkIn,
	checkOut,
	nights,
	guestCounts,
	roomType,
	ratePlanCode,
	pricing,
	originalPricing,
	isLoadingPricing,
	isEditMode,
}) => {
	// Check if pricing has changed
	const pricingChanged = useMemo(() => {
		if (!isEditMode || !pricing || !originalPricing) return false;
		const oldPrice = originalPricing.amountAfterTax || 0;
		const newPrice = pricing.amountAfterTax || 0;
		return Math.abs(oldPrice - newPrice) > 0.01;
	}, [isEditMode, pricing, originalPricing]);

	const totalGuests = guestCounts.adults + guestCounts.children;
	const guestSummary = `${guestCounts.adults} adults${guestCounts.children > 0 ? `, ${guestCounts.children} children` : ''}`;

	// Determine which pricing to display
	const displayPricing = isEditMode && pricing ? pricing : originalPricing;

	return (
		<div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
			<h3 className="font-medium text-gray-900 dark:text-white mb-4">Reservation Summary</h3>
			<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
				<div>
					<p className="text-sm text-gray-500 dark:text-gray-400">Check-in Date</p>
					<p className="font-semibold text-gray-900 dark:text-white">{checkIn}</p>
				</div>
				<div>
					<p className="text-sm text-gray-500 dark:text-gray-400">Check-out Date</p>
					<p className="font-semibold text-gray-900 dark:text-white">{checkOut}</p>
				</div>
				<div>
					<p className="text-sm text-gray-500 dark:text-gray-400">Number of Nights</p>
					<p className="font-semibold text-gray-900 dark:text-white">{nights}</p>
				</div>
				<div>
					<p className="text-sm text-gray-500 dark:text-gray-400">Total Guests</p>
					<p className="font-semibold text-gray-900 dark:text-white">
						{totalGuests}{' '}
						<span className="text-sm font-normal text-gray-500">({guestSummary})</span>
					</p>
				</div>
				<div>
					<p className="text-sm text-gray-500 dark:text-gray-400">Room Type</p>
					<p className="font-semibold text-gray-900 dark:text-white">{roomType || 'Standard'}</p>
				</div>
				<div>
					<p className="text-sm text-gray-500 dark:text-gray-400">Rate Plan</p>
					<p className="font-semibold text-gray-900 dark:text-white">
						{ratePlanCode || 'Standard Rate'}
					</p>
				</div>

				{displayPricing && (
					<>
						<div>
							<p className="text-sm text-gray-500 dark:text-gray-400">Total (Before Tax)</p>
							<p
								className={`font-semibold ${pricingChanged ? 'text-orange-600 dark:text-orange-400' : 'text-gray-900 dark:text-white'}`}
							>
								{displayPricing.currencyCode || 'USD'} $
								{displayPricing.amountBeforeTax?.toFixed(2) || '0.00'}
							</p>
						</div>
						<div>
							<p className="text-sm text-gray-500 dark:text-gray-400">Total (After Tax)</p>
							<p
								className={`font-bold text-lg ${pricingChanged ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400'}`}
							>
								{displayPricing.currencyCode || 'USD'} $
								{displayPricing.amountAfterTax?.toFixed(2) || '0.00'}
							</p>
						</div>
					</>
				)}
			</div>

			{isEditMode && isLoadingPricing && (
				<div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-sm">
					<p className="text-blue-800 dark:text-blue-200">
						<strong>Loading updated pricing...</strong>
					</p>
				</div>
			)}

			{isEditMode && pricingChanged && !isLoadingPricing && (
				<div className="mt-3 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded text-sm">
					<p className="text-orange-800 dark:text-orange-200">
						<strong>Price Updated:</strong> The pricing has changed based on your new dates and
						guest count.
					</p>
				</div>
			)}

			{isEditMode && !pricingChanged && !isLoadingPricing && pricing && (
				<div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded text-sm">
					<p className="text-green-800 dark:text-green-200">
						<strong>No Price Change:</strong> Your modifications don't affect the total price.
					</p>
				</div>
			)}
		</div>
	);
};
