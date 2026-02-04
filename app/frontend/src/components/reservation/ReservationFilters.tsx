'use client';

import { useReservations } from '@/hooks/useReservations';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Button from '@/components/ui/button/Button';
import { useState, useMemo } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@/icons';

export default function ReservationFilters() {
	const { filters, handleFilterChange, hotels } = useReservations();
	const [isExpanded, setIsExpanded] = useState(true);

	// Ensure hotels is an array before using it
	const safeHotels = Array.isArray(hotels) ? hotels : [];

	// Calculate active filters count and summary
	const filterSummary = useMemo(() => {
		const active: string[] = [];

		if (filters.hotelId) {
			const hotel = safeHotels.find((h) => h.hotelCode === filters.hotelId);
			if (hotel) active.push(`Hotel: ${hotel.hotelName || hotel.hotelCode}`);
		}
		if (filters.surname) active.push(`Surname: ${filters.surname}`);
		if (filters.givenName) active.push(`Name: ${filters.givenName}`);
		if (filters.startDate) active.push(`From: ${filters.startDate}`);
		if (filters.endDate) active.push(`To: ${filters.endDate}`);
		if (filters.guests) active.push(`${filters.guests} guest${filters.guests !== '1' ? 's' : ''}`);
		if (filters.children)
			active.push(`${filters.children} child${filters.children !== '1' ? 'ren' : ''}`);

		return active;
	}, [filters, safeHotels]);

	const clearAllFilters = () => {
		handleFilterChange('hotelId', '');
		handleFilterChange('surname', '');
		handleFilterChange('givenName', '');
		handleFilterChange('arrivalStartDate', '');
		handleFilterChange('arrivalEndDate', '');
		handleFilterChange('guests', '');
		handleFilterChange('children', '');
	};

	return (
		<div className="rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3">
			{/* Header with toggle and summary */}
			<div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-white/5">
				<div className="flex items-center gap-3">
					<h3 className="text-sm font-semibold text-gray-800 dark:text-white">Filters</h3>
					{filterSummary.length > 0 && (
						<div className="flex flex-wrap gap-2">
							{filterSummary.slice(0, 3).map((filter, idx) => (
								<span
									key={idx}
									className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
								>
									{filter}
								</span>
							))}
							{filterSummary.length > 3 && (
								<span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
									+{filterSummary.length - 3} more
								</span>
							)}
						</div>
					)}
				</div>
				<div className="flex items-center gap-2">
					{filterSummary.length > 0 && (
						<Button size="sm" variant="outline" onClick={clearAllFilters} className="text-xs">
							Clear All
						</Button>
					)}
					<button
						onClick={() => setIsExpanded(!isExpanded)}
						className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
					>
						{isExpanded ? (
							<>
								<ChevronUpIcon className="h-4 w-4" />
								Hide
							</>
						) : (
							<>
								<ChevronDownIcon className="h-4 w-4" />
								Show
							</>
						)}
					</button>
				</div>
			</div>

			{/* Filter inputs */}
			{isExpanded && (
				<div className="p-5">
					<div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
						{/* Hotel Select (Required/Primary) */}
						<div className="space-y-1">
							<Label>Hotel</Label>
							<div className="relative">
								<select
									className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-sm text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:text-white/90 dark:focus:border-brand-500"
									value={filters.hotelId}
									onChange={(e) => handleFilterChange('hotelId', e.target.value)}
								>
									<option value="">Select Hotel</option>
									{safeHotels.map((h: any) => (
										<option key={h.hotelCode} value={h.hotelCode}>
											{h.hotelName || h.hotelCode || 'Unknown Hotel'}
										</option>
									))}
								</select>
							</div>
						</div>

						{/* Surname */}
						<div className="space-y-1">
							<Label>Surname</Label>
							<Input
								value={filters.surname}
								onChange={(e) => handleFilterChange('surname', e.target.value)}
								placeholder="Smith"
							/>
						</div>

						{/* First Name */}
						<div className="space-y-1">
							<Label>First Name</Label>
							<Input
								value={filters.givenName}
								onChange={(e) => handleFilterChange('givenName', e.target.value)}
								placeholder="John"
							/>
						</div>

						{/* Guests */}
						<div className="space-y-1">
							<Label>Guests</Label>
							<Input
								type="number"
								min="1"
								value={filters.guests}
								onChange={(e) => handleFilterChange('guests', e.target.value)}
								placeholder="1"
							/>
						</div>

						{/* Children */}
						<div className="space-y-1">
							<Label>Children</Label>
							<Input
								type="number"
								min="0"
								value={filters.children}
								onChange={(e) => handleFilterChange('children', e.target.value)}
								placeholder="0"
							/>
						</div>

						{/* Date: Arrival Range */}
						<div className="space-y-1">
							<Label>Arrival From</Label>
							<Input
								type="date"
								value={filters.startDate}
								onChange={(e) => handleFilterChange('arrivalStartDate', e.target.value)}
							/>
						</div>

						<div className="space-y-1">
							<Label>Arrival To</Label>
							<Input
								type="date"
								value={filters.endDate}
								onChange={(e) => handleFilterChange('arrivalEndDate', e.target.value)}
							/>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
