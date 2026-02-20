'use client';

import React, { useState } from 'react';
import { ChevronDownIcon, BuildingsIcon } from '@/icons';
import { Dropdown } from '@/components/ui/dropdown/Dropdown';
import { DropdownItem } from '@/components/ui/dropdown/DropdownItem';
import { useHotel } from '@/context/HotelContext';

export default function HotelSelector() {
	const { selectedHotel, hotels, setSelectedHotelId, isLoading } = useHotel();
	const [isOpen, setIsOpen] = useState(false);

	const displayName = isLoading
		? 'Loading hotels...'
		: (selectedHotel?.hotelName ?? selectedHotel?.hotelCode ?? 'Select Hotel');

	return (
		<div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-5 py-4 dark:border-gray-800 dark:bg-white/[0.03]">
			<div className="flex items-center gap-3">
				<div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-xl dark:bg-gray-800">
					<BuildingsIcon className="text-gray-800 size-5 dark:text-white/90" />
				</div>
				<div>
					<p className="text-xs text-gray-500 dark:text-gray-400">Viewing data for</p>
					<p className="font-semibold text-gray-800 dark:text-white/90">{displayName}</p>
				</div>
			</div>

			<div className="relative inline-block">
				<button
					onClick={() => setIsOpen(!isOpen)}
					disabled={isLoading || hotels.length === 0}
					className="dropdown-toggle inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:text-gray-800 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
				>
					Switch Hotel
					<ChevronDownIcon className="size-4" />
				</button>
				<Dropdown isOpen={isOpen} onClose={() => setIsOpen(false)} className="w-64 p-2">
					{hotels.map((hotel) => {
						const id = hotel.hotelId ?? hotel.hotelCode ?? '';
						const name = hotel.hotelName ?? hotel.hotelCode ?? id;
						const isSelected = id === (selectedHotel?.hotelId ?? selectedHotel?.hotelCode);
						return (
							<DropdownItem
								key={id}
								onItemClick={() => {
									setSelectedHotelId(id);
									setIsOpen(false);
								}}
								className={isSelected ? 'font-semibold text-brand-600 dark:text-brand-400' : ''}
							>
								{name}
							</DropdownItem>
						);
					})}
				</Dropdown>
			</div>
		</div>
	);
}
