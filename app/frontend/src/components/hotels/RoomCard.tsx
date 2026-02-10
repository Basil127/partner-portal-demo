import React from 'react';
import { RoomType } from './types';
import Button from '@/components/ui/button/Button';
import { UserIcon, BoxIcon, DollarLineIcon } from '@/icons/index';

interface RoomCardProps {
	room: RoomType;
}

export default function RoomCard({ room }: RoomCardProps) {
	const imageUrl =
		room.images && room.images.length > 0
			? room.images[0].url
			: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&h=600&fit=crop';

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

				{/* Price Badge */}
				{room.rate?.base && (
					<div className="absolute top-4 right-4 bg-white dark:bg-gray-900 px-3 py-1.5 rounded-lg shadow-lg z-10">
						<div className="flex items-center gap-1">
							{/* flexible container for icon */}
							<div className="flex-shrink-0 flex items-center justify-center">
								<DollarLineIcon
									className="w-5 h-5 text-primary-500"
									w={20}
									h={20}
									viewBox="3 3 24 24"
								/>
							</div>
							<span className="text-lg font-bold text-gray-900 dark:text-white leading-none">
								{room.rate.base}
							</span>
							<span className="text-xs text-gray-500 dark:text-gray-400 self-end mb-0.5">
								/{room.rate.currency || 'USD'}
							</span>
						</div>
						<p className="text-[10px] text-gray-500 dark:text-gray-400 text-center mt-0.5">
							per night
						</p>
					</div>
				)}

				{/* Room Name on Image */}
				<div className="absolute bottom-4 left-4 right-4 z-10">
					<h3 className="text-lg font-bold text-white drop-shadow-md">
						{room.roomName || room.roomType || 'Room'}
					</h3>
				</div>
			</div>

			{/* Room Details */}
			<div className="p-4 space-y-3">
				{room.roomDescription && (
					<p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 min-h-[40px]">
						{room.roomDescription}
					</p>
				)}

				{/* Room Features */}
				<div className="flex flex-wrap gap-2">
					{room.maxOccupancy && (
						<div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 dark:bg-gray-700 rounded-md">
							<UserIcon className="w-4 h-4 text-gray-600 dark:text-gray-400 flex-shrink-0" />
							<span className="text-xs font-medium text-gray-700 dark:text-gray-300">
								Up to {room.maxOccupancy} guests
							</span>
						</div>
					)}
					{room.bedTypes && (
						<div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 dark:bg-gray-700 rounded-md">
							<BoxIcon className="w-4 h-4 text-gray-600 dark:text-gray-400 flex-shrink-0" />
							<span className="text-xs font-medium text-gray-700 dark:text-gray-300">
								{room.bedTypes}
							</span>
						</div>
					)}
					{room.roomSize && (
						<div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 dark:bg-gray-700 rounded-md">
							<span className="text-xs font-medium text-gray-700 dark:text-gray-300">
								{room.roomSize} {room.roomSizeUOM || 'sq ft'}
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
