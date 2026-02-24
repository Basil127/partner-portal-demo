import React, { useEffect, useState } from 'react';
import ComponentCard from '../common/ComponentCard';
import { useBooking } from '@/context/BookingContext';
import type { ContentRoomType } from '@/types/room';
import Button from '../ui/button/Button';
import Link from 'next/link';
import { getApiHotelsByHotelCodeOffers } from '@/lib/api-client';

interface PricingSidebarProps {
	hotelId: string;
	roomId: string;
	room: ContentRoomType;
}

interface PricingData {
	amountBeforeTax: number;
	amountAfterTax: number;
	currencyCode: string;
}

export default function PricingSidebar({ hotelId, roomId, room }: PricingSidebarProps) {
	const { checkIn, checkOut, adults, children, setCheckIn, setCheckOut, setAdults, setChildren } =
		useBooking();

	const [pricing, setPricing] = useState<PricingData | null>(null);
	const [pricingLoading, setPricingLoading] = useState(false);

	const nights = Math.max(
		1,
		Math.floor((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)),
	);

	useEffect(() => {
		if (!checkIn || !checkOut || !hotelId || !roomId) return;

		setPricingLoading(true);
		getApiHotelsByHotelCodeOffers({
			path: { hotelCode: hotelId },
			query: {
				arrivalDate: checkIn,
				departureDate: checkOut,
				adults,
				children,
			},
		})
			.then((resp) => {
				const stay = resp.data?.roomStays?.[0];
				const offers = stay?.offers as Array<{
					roomType?: string;
					total?: { amountBeforeTax?: number; amountAfterTax?: number; currencyCode?: string };
				}> | undefined;

				if (!offers) return;

				// The API strips underscores from room type codes (CC_DLX_GV → CCDLXGV)
				const normalizedRoomId = roomId.replace(/_/g, '').toUpperCase();
				const match = offers.find(
					(o) => o.roomType?.toUpperCase() === normalizedRoomId,
				);

				if (match?.total) {
					setPricing({
						amountBeforeTax: match.total.amountBeforeTax ?? 0,
						amountAfterTax: match.total.amountAfterTax ?? 0,
						currencyCode: match.total.currencyCode ?? 'USD',
					});
				}
			})
			.catch(() => {
				// Pricing unavailable — leave as null
			})
			.finally(() => {
				setPricingLoading(false);
			});
	}, [checkIn, checkOut, hotelId, roomId, adults, children]);

	const taxAmount = pricing
		? Math.round((pricing.amountAfterTax - pricing.amountBeforeTax) * 100) / 100
		: null;
	const perNight = pricing ? Math.round((pricing.amountAfterTax / nights) * 100) / 100 : null;

	return (
		<div className="lg:sticky lg:top-6">
			<ComponentCard title="Booking Details">
				<div className="space-y-6">
					{/* Booking Filters */}
					<div className="grid grid-cols-2 grid-rows-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
								Check-in
							</label>
							<input
								type="date"
								value={checkIn}
								onChange={(e) => setCheckIn(e.target.value)}
								min={new Date().toISOString().split('T')[0]}
								className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
								Check-out
							</label>
							<input
								type="date"
								value={checkOut}
								onChange={(e) => setCheckOut(e.target.value)}
								min={checkIn}
								className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
								Adults
							</label>
							<input
								type="number"
								value={adults}
								onChange={(e) => {
									const val = Math.max(1, parseInt(e.target.value) || 1);
									setAdults(val);
								}}
								min="1"
								max={room.occupancy?.maxAdults || room.occupancy?.maxOccupancy || 4}
								className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
								Children
							</label>
							<input
								type="number"
								value={children}
								onChange={(e) => {
									const val = Math.max(0, parseInt(e.target.value) || 0);
									setChildren(val);
								}}
								min="0"
								max={room.occupancy?.maxChildren || room.occupancy?.maxOccupancy || 4}
								className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
							/>
						</div>
					</div>

					{/* Pricing Section */}
					<div className="pt-6 border-t border-gray-200 dark:border-gray-700">
						<div className="space-y-4">
							{pricingLoading ? (
								<div className="flex items-center justify-center py-4">
									<div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-brand-500" />
									<span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
										Loading pricing…
									</span>
								</div>
							) : pricing ? (
								<>
									<div className="flex items-baseline justify-between">
										<div>
											<div className="text-3xl font-bold text-gray-900 dark:text-white">
												{pricing.currencyCode} {perNight?.toFixed(2)}
											</div>
										</div>
										<div className="text-right">
											<p className="text-sm text-gray-600 dark:text-gray-400">
												{nights} {nights === 1 ? 'night' : 'nights'}
											</p>
										</div>
									</div>

									<div className="space-y-2">
										<div className="flex justify-between text-sm">
											<span className="text-gray-600 dark:text-gray-400">Subtotal</span>
											<span className="font-medium text-gray-900 dark:text-white">
												{pricing.currencyCode} {pricing.amountBeforeTax.toFixed(2)}
											</span>
										</div>
										<div className="flex justify-between text-sm pb-4 border-b border-gray-200 dark:border-gray-700">
											<span className="text-gray-600 dark:text-gray-400">Taxes & fees</span>
											<span className="font-medium text-gray-900 dark:text-white">
												{pricing.currencyCode} {taxAmount?.toFixed(2)}
											</span>
										</div>
										<div className="flex justify-between items-center pt-2">
											<span className="font-semibold text-gray-900 dark:text-white">Total</span>
											<span className="text-2xl font-bold text-gray-900 dark:text-white">
												{pricing.currencyCode} {pricing.amountAfterTax.toFixed(2)}
											</span>
										</div>
									</div>
								</>
							) : (
								<p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
									Pricing unavailable for selected dates
								</p>
							)}

							<Link href={`/reservations/new?hotelId=${hotelId}&roomId=${roomId}`}>
								<Button
									variant="primary"
									size="md"
									className="w-full mt-4"
								>
									Continue
								</Button>
							</Link>
							<p className="text-xs text-center text-gray-500 dark:text-gray-400">
								You won't be charged yet
							</p>
						</div>
					</div>

					{/* Room Quick Info */}
					<div className="pt-6 border-t border-gray-200 dark:border-gray-700 space-y-2">
						<div className="flex items-center justify-between text-sm">
							<span className="text-gray-600 dark:text-gray-400">Guest Capacity</span>
							<span className="font-medium text-gray-900 dark:text-white">
								{room.occupancy?.maxOccupancy || 2} guests
							</span>
						</div>
						<div className="flex items-center justify-between text-sm">
							<span className="text-gray-600 dark:text-gray-400">Bed Type</span>
							<span className="font-medium text-gray-900 dark:text-white">
								{room.roomPrimaryBedType || 'King'}
							</span>
						</div>
						{room.nonSmokingInd && (
							<div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
								<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
									<path
										fillRule="evenodd"
										d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
										clipRule="evenodd"
									/>
								</svg>
								<span>Non-smoking</span>
							</div>
						)}
					</div>
				</div>
			</ComponentCard>
		</div>
	);
}
