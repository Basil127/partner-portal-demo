import React, { useState } from 'react';
import type { ContentRoomType as RoomType } from '@partner-portal/backend/api-types';
import ComponentCard from '@/components/common/ComponentCard';
import RoomCard from './RoomCard';
import { ListIcon } from '@/icons/index';
import Button from '@/components/ui/button/Button';
import { useBooking } from '@/context/BookingContext';

interface RoomListProps {
	hotelCode: string;
	rooms: RoomType[];
}

export default function RoomList({ hotelCode, rooms }: RoomListProps) {
	const [showFilters, setShowFilters] = useState(false);
	const { adults, children, minPrice, maxPrice, setMinPrice, setMaxPrice, setAdults, setChildren } =
		useBooking();

	const getActiveFilterSummary = () => {
		const parts = [];
		if (minPrice && minPrice > 0) parts.push(`Min $${minPrice}`);
		if (maxPrice && maxPrice < 1000) parts.push(`Max $${maxPrice}`);
		if (adults) parts.push(`${adults} Adults`);
		if (children) parts.push(`${children} Kids`);
		return parts.join(', ');
	};

	const filteredRooms = rooms.filter((room) => {
		// Price filter removed as rate is not in the API response
		const reqAdults = adults ? Number(adults) : 0;
		const reqChildren = children ? Number(children) : 0;

		// probably missing data
		if (
			room.occupancy == null ||
			(room.occupancy.maxChildren == null &&
				room.occupancy.maxAdults == null &&
				room.occupancy.maxOccupancy == null)
		)
			return true;

		if (room.occupancy.maxChildren || room.occupancy.maxAdults) {
			// Use maxAdults and maxChildren if available
			if (reqAdults > 0 && (room.occupancy?.maxAdults || 0) < reqAdults) return false;
			if (reqChildren > 0 && (room.occupancy?.maxChildren || 0) < reqChildren) return false;
		} else {
			// Fallback to total occupancy if maxAdults/maxChildren not available
			const totalReq = reqAdults + reqChildren;
			if (totalReq > 0 && (room.occupancy?.maxOccupancy || 0) < totalReq) return false;
		}

		return true;
	});

	if (!rooms || rooms.length === 0) {
		return (
			<ComponentCard title="Available Rooms">
				<div className="text-center py-12">
					<p className="text-gray-600 dark:text-gray-400">
						No room information available for this hotel.
					</p>
				</div>
			</ComponentCard>
		);
	}

	return (
		<ComponentCard
			title="Available Rooms"
			action={
				<div className="flex items-center gap-2">
					{!showFilters && getActiveFilterSummary() && (
						<span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
							{getActiveFilterSummary()}
						</span>
					)}
					<Button
						variant="outline"
						size="sm"
						onClick={() => setShowFilters(!showFilters)}
						className="flex items-center gap-2"
					>
						<ListIcon width={16} height={16} />
						<span>Filter</span>
					</Button>
				</div>
			}
		>
			{showFilters && (
				<div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
						<div>
							<label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
								Min Price
							</label>
							<input
								type="number"
								placeholder="0"
								className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 text-sm"
								value={minPrice}
								onChange={(e) => setMinPrice(Number(e.target.value) || 0)}
							/>
						</div>
						<div>
							<label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
								Max Price
							</label>
							<input
								type="number"
								placeholder="Any"
								className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 text-sm"
								value={maxPrice || Infinity}
								onChange={(e) => setMaxPrice(Number(e.target.value) || Infinity)}
							/>
						</div>
						<div>
							<label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
								Min Adults
							</label>
							<input
								type="number"
								placeholder="1"
								className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 text-sm"
								value={adults}
								onChange={(e) => setAdults(Number(e.target.value) || 1)}
								min={1}
							/>
						</div>
						<div>
							<label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
								Min Children
							</label>
							<input
								type="number"
								placeholder="0"
								className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 text-sm"
								value={children}
								onChange={(e) => setChildren(Number(e.target.value) || 0)}
								min={0}
							/>
						</div>
					</div>
				</div>
			)}

			<div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
				{filteredRooms.map((room, index) => (
					<RoomCard key={index} hotelCode={hotelCode} room={room} />
				))}
				{filteredRooms.length === 0 && (
					<div className="col-span-full text-center py-12 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
						<p className="text-gray-500 dark:text-gray-400">No rooms match your filters.</p>
						<Button
							variant="primary"
							className="mt-2 text-primary-500"
							onClick={() => {
								setMinPrice(0);
								setMaxPrice(Infinity);
								setAdults(2);
								setChildren(0);
							}}
						>
							Clear Filters
						</Button>
					</div>
				)}
			</div>
		</ComponentCard>
	);
}
