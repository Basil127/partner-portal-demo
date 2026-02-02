'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Button from '@/components/ui/button/Button';
import HotelDetailsCard from '@/components/hotels/HotelDetailsCard';
import RoomList from '@/components/hotels/RoomList';
import { useHotelDetails } from '@/hooks/useHotelDetails';

export default function HotelDetailPage() {
	const params = useParams();
	const hotelId = params?.hotelId as string;

	const { hotelInfo, roomTypes, loading, error } = useHotelDetails(hotelId);

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-[60vh]">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
					<p className="mt-4 text-gray-600 dark:text-gray-400">Loading hotel information...</p>
				</div>
			</div>
		);
	}

	if (error || !hotelInfo) {
		return (
			<div className="flex items-center justify-center min-h-[60vh]">
				<div className="text-center">
					<p className="text-lg text-gray-600 dark:text-gray-400">{error || 'Hotel not found'}</p>
					<Button onClick={() => window.history.back()} className="mt-4">
						Go Back
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<HotelDetailsCard hotelInfo={hotelInfo} />
			<RoomList rooms={roomTypes} hotelCode={hotelInfo.hotelCode || ''} />
		</div>
	);
}
