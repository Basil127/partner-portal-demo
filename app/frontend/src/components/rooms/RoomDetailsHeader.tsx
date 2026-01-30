import React from 'react';
import type { ContentRoomType as RoomType } from '@partner-portal/backend/api-types';
import CarouselImages from '@/components/ui/images/CarouselImages';
import Badge from '@/components/ui/badge/Badge';

interface RoomDetailsHeaderProps {
	room: RoomType;
}

export default function RoomDetailsHeader({ room }: RoomDetailsHeaderProps) {
	// Mock images - in a real app these would come from the API or a more robust mapping
	const images = (room as any).images || [
		{ url: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&h=600&fit=crop' },
		{ url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop' },
		{ url: 'https://images.unsplash.com/photo-1631049307208-950375459385?w=800&h=600&fit=crop' },
	];

	return (
		<div className="space-y-6">
			<div className="relative rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800">
				<div className="h-[300px] md:h-[400px] w-full">
					<CarouselImages images={images} />
				</div>
                <div className="absolute top-4 right-4 z-10">
                     {room.roomType && (
                        <Badge variant="light" color="light" className="backdrop-blur-md bg-white/30 dark:bg-black/30 text-white border-white/20">
                            {room.roomType}
                        </Badge>
                     )}
                </div>
			</div>

			<div>
				<h1 className="text-3xl font-bold text-gray-900 dark:text-white">
					{room.roomName || 'Luxury Room'}
				</h1>
				{room.hotelRoomType && (
					<span className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-2 block">
						Room Code: {room.hotelRoomType}
					</span>
				)}
			</div>
		</div>
	);
}
