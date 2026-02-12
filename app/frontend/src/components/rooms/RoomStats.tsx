import React from 'react';
import type { ContentRoomType } from '@/types/room';

interface RoomStatsProps {
	room: ContentRoomType;
}

export default function RoomStats({ room }: RoomStatsProps) {
	return (
		<div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y border-gray-100 dark:border-gray-800 my-6">
			<div className="text-center">
				<p className="text-sm text-gray-500 dark:text-gray-400">Occupancy</p>
				<p className="font-semibold text-gray-900 dark:text-white">
					{room.occupancy?.maxOccupancy ? `${room.occupancy.maxOccupancy} Guests` : '2 Guests'}
				</p>
			</div>
			<div className="text-center">
				<p className="text-sm text-gray-500 dark:text-gray-400">Bed Type</p>
				<p className="font-semibold text-gray-900 dark:text-white">
					{room.roomPrimaryBedType || 'King Size'}
				</p>
			</div>
			<div className="text-center">
				<p className="text-sm text-gray-500 dark:text-gray-400">Room Category</p>
				<p className="font-semibold text-gray-900 dark:text-white">
					{room.roomCategory || 'Standard'}
				</p>
			</div>
			<div className="text-center">
				<p className="text-sm text-gray-500 dark:text-gray-400">View</p>
				<p className="font-semibold text-gray-900 dark:text-white">
					{room.roomViewType || 'City View'}
				</p>
			</div>
		</div>
	);
}
