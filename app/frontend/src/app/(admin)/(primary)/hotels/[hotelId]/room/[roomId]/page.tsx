'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Button from '@/components/ui/button/Button';
import ComponentCard from '@/components/common/ComponentCard';
import RoomDetailsHeader from '@/components/rooms/RoomDetailsHeader';
import RoomDescription from '@/components/rooms/RoomDescription';
import AmenitiesList from '@/components/common/AmenitiesList';
import { useRoomDetails } from '@/hooks/useRoomDetails';
import Badge from '@/components/ui/badge/Badge';
import type { ContentRoomType } from '@partner-portal/backend/api-types';

export default function RoomDetailPage() {
	const params = useParams();
	const hotelId = params?.hotelId as string;
	const roomId = params?.roomId as string;

	const { room: apiRoom, loading } = useRoomDetails(hotelId, roomId);

    // Mock Room Data for fallback
    const mockRoom: ContentRoomType = {
        hotelRoomType: 'MOCK-001',
        roomType: 'Mock_Deluxe',
        roomName: 'Mock Deluxe Room (Fallback)',
        description: ['This is a mock room displayed because the requested room ID was not found or is invalid.', 'In a production environment, this would handle the error gracefully.'],
        roomCategory: 'Deluxe',
        roomViewType: 'City View',
        roomPrimaryBedType: 'King',
        nonSmokingInd: true,
        occupancy: {
            minOccupancy: 1,
            maxOccupancy: 2,
            maxAdultOccupancy: 2,
            maxChildOccupancy: 0,
        },
        numberOfUnits: 1,
        roomAmenities: [
            { roomAmenity: 'WIFI', description: 'Free Wi-Fi (Mock)', quantity: 1, includeInRate: true, confirmable: false },
            { roomAmenity: 'AC', description: 'Air Conditioning (Mock)', quantity: 1, includeInRate: true, confirmable: false },
            { roomAmenity: 'TV', description: 'Smart TV (Mock)', quantity: 1, includeInRate: true, confirmable: false },
        ]
    };

    const room = apiRoom || mockRoom;
    const isMock = !apiRoom;

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-[60vh]">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
					<p className="mt-4 text-gray-600 dark:text-gray-400">Loading room details...</p>
				</div>
			</div>
		);
	}

	// Error handling removed to show mock room instead

	// Use actual room amenities from API or fallback to mock amenities
	const roomAmenities = room.roomAmenities || [
		{ roomAmenity: 'WIFI', description: 'Free Wi-Fi', quantity: 1, includeInRate: true, confirmable: false },
		{ roomAmenity: 'TV', description: '55" Smart TV', quantity: 1, includeInRate: true, confirmable: false },
		{ roomAmenity: 'AC', description: 'Climate Control', quantity: 1, includeInRate: true, confirmable: false },
		{ roomAmenity: 'MINIBAR', description: 'Mini Bar', quantity: 1, includeInRate: false, confirmable: false },
		{ roomAmenity: 'SAFE', description: 'Electronic Safe', quantity: 1, includeInRate: true, confirmable: false },
		{ roomAmenity: 'SHOWER', description: 'Rain Shower', quantity: 1, includeInRate: true, confirmable: false },
		{ roomAmenity: 'WORKSPACE', description: 'Work Desk', quantity: 1, includeInRate: true, confirmable: false },
		{ roomAmenity: 'SERVICE', description: '24/7 Room Service', quantity: 1, includeInRate: false, confirmable: false },
	];

    // Room Stats Component
    const RoomStats = () => (
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

	return (
		<div className="relative space-y-6">
            {/* Mock Room Badge */}
            {isMock && (
            <div className="absolute top-0 right-0 z-20 pointer-events-none">
                 <Badge color="warning" variant="solid" className="shadow-lg rounded-bl-xl rounded-tr-none px-4 py-2 text-xs font-bold uppercase tracking-wider">
                    Mock Room
                </Badge>
            </div>
            )}

			<ComponentCard title="Room Details">
				<RoomDetailsHeader room={room} />
                <RoomStats />
				<div className="grid gap-8 lg:grid-cols-3 mt-8">
					<div className="lg:col-span-2 space-y-8">
						<RoomDescription room={room} />
                        <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
						    <AmenitiesList amenities={roomAmenities} title="Room Amenities" />
                        </div>
					</div>
				</div>
			</ComponentCard>
		</div>
	);
}
