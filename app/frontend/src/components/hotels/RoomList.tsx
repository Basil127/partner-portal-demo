import React, { useState } from 'react';
import type { ContentRoomType as RoomType } from '@partner-portal/backend/api-types';
import ComponentCard from '@/components/common/ComponentCard';
import RoomCard from './RoomCard';
import { ListIcon } from '@/icons/index';
import Button from '@/components/ui/button/Button';

interface RoomListProps {
	rooms: RoomType[];
}

export default function RoomList({ rooms }: RoomListProps) {
	const [showFilters, setShowFilters] = useState(false);
	const [filters, setFilters] = useState({
		minPrice: '',
		maxPrice: '',
		adults: '',
		children: '',
	});

	const handleFilterChange = (key: string, value: string) => {
		setFilters((prev) => ({ ...prev, [key]: value }));
	};

	const getActiveFilterSummary = () => {
		const parts = [];
		if (filters.minPrice) parts.push(`Min $${filters.minPrice}`);
		if (filters.maxPrice) parts.push(`Max $${filters.maxPrice}`);
		if (filters.adults) parts.push(`${filters.adults} Adults`);
		if (filters.children) parts.push(`${filters.children} Kids`);
		return parts.join(', ');
	};

	const filteredRooms = rooms.filter((room) => {
		// Price filter removed as rate is not in the API response
		const reqAdults = filters.adults ? Number(filters.adults) : 0;
		const reqChildren = filters.children ? Number(filters.children) : 0;

		// Basic filtering logic
		if (reqAdults > 0 && (room.occupancy?.maxAdultOccupancy || 0) < reqAdults) return false;
		if (reqChildren > 0 && (room.occupancy?.maxChildOccupancy || 0) < reqChildren) return false;

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
								value={filters.minPrice}
								onChange={(e) => handleFilterChange('minPrice', e.target.value)}
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
								value={filters.maxPrice}
								onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
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
								value={filters.adults}
								onChange={(e) => handleFilterChange('adults', e.target.value)}
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
								value={filters.children}
								onChange={(e) => handleFilterChange('children', e.target.value)}
							/>
						</div>
					</div>
				</div>
			)}

			<div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
				{filteredRooms.map((room, index) => (
					<RoomCard key={index} room={room} />
				))}
				{filteredRooms.length === 0 && (
					<div className="col-span-full text-center py-12 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
						<p className="text-gray-500 dark:text-gray-400">No rooms match your filters.</p>
						<Button
							variant="primary"
							className="mt-2 text-primary-500"
							onClick={() => setFilters({ minPrice: '', maxPrice: '', adults: '', children: '' })}
						>
							Clear Filters
						</Button>
					</div>
				)}
			</div>
		</ComponentCard>
	);
}
