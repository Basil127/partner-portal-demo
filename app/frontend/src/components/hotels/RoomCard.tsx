import React from 'react';
import type { ContentRoomType as RoomType } from '@partner-portal/backend/api-types';
import Button from '@/components/ui/button/Button';
import { UserIcon, BoxIcon, DollarLineIcon } from '@/icons/index';

interface RoomCardProps {
	room: RoomType;
}

export default function RoomCard({ room }: RoomCardProps) {
	const imageUrl = 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&h=600&fit=crop';

	return (
		<div className="group relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-lg transition-all duration-300">
			{/* Room Image with overlay */}
			<div className="relative h-48 overflow-hidden">
				<div
					className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
					style={{
						backgroundImage: `url(${imageUrl})`,
					}}
				>
					<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
				</div>

				{/* Room Name on Image */}
				<div className="absolute bottom-4 left-4 right-4 z-10">
					<h3 className="text-lg font-bold text-white drop-shadow-md">
						{room.roomName || room.roomType || 'Room'}
					</h3>
				</div>
			</div>

			{/* Room Details */}
			<div className="p-4 space-y-3">
				{room.description && room.description.length > 0 && (
					<p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 min-h-10">
						{room.description[0]}
					</p>
				)}

				{/* Room Features */}
				<div className="flex flex-wrap gap-2">
					{room.occupancy?.maxOccupancy && (
						<div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 dark:bg-gray-700 rounded-md">
							<UserIcon className="w-4 h-4 text-gray-600 dark:text-gray-400 shrink-0" />
							<span className="text-xs font-medium text-gray-700 dark:text-gray-300">
								Up to {room.occupancy.maxOccupancy} guests
							</span>
						</div>
					)}
					{room.roomPrimaryBedType && (
						<div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 dark:bg-gray-700 rounded-md">
							<BoxIcon className="w-4 h-4 text-gray-600 dark:text-gray-400 shrink-0" />
							<span className="text-xs font-medium text-gray-700 dark:text-gray-300">
								{room.roomPrimaryBedType}
							</span>
						</div>
					)}
					{room.roomViewType && (
						<div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 dark:bg-gray-700 rounded-md">
							<span className="text-xs font-medium text-gray-700 dark:text-gray-300">
								{room.roomViewType}
							</span>
						</div>
					)}
				</div>

				{/* Action Button */}
				<div className="pt-2">
					<Button
						variant="primary"
						size="sm"
						className="w-full"
						onClick={() => console.log('Book room:', room.roomType)}
					>
						View Details
					</Button>
				</div>
			</div>
		</div>
	);
}
