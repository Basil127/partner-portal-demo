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
import { RoomType } from '@/components/rooms/types';

export default function RoomDetailPage() {
	const params = useParams();
	const hotelId = params?.hotelId as string;
	const roomId = params?.roomId as string;

	const { room: apiRoom, loading } = useRoomDetails(hotelId, roomId);

    // Mock Room Data for fallback
    const mockRoom: RoomType = {
        hotelRoomType: 'MOCK-001',
        roomType: 'Mock Deluxe Room',
        roomName: 'Mock Deluxe Room (Fallback)',
        roomDescription: 'This is a mock room displayed because the requested room ID was not found or is invalid. In a production environment, this would handle the error gracefully.',
        maxOccupancy: 2,
        bedTypes: '1 King Bed',
        roomSize: 400,
        roomSizeUOM: 'sq ft',
        rate: { base: 150, currency: 'USD' },
        images: [
            { url: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&h=600&fit=crop' },
            { url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop' },
        ],
        // @ts-ignore - amenities might not be in generic RoomType yet but used in UI
        amenities: [
            { code: 'wifi', description: 'Free Wi-Fi (Mock)' },
            { code: 'ac', description: 'Air Conditioning (Mock)' },
             { code: 'tv', description: 'Smart TV (Mock)' },
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

	// Mock amenities for the room - typically this would come from the API
	const roomAmenities = (room as any).amenities || [
		{ code: 'wifi', description: 'Free Wi-Fi' },
		{ code: 'tv', description: '55" Smart TV' },
		{ code: 'ac', description: 'Climate Control' },
		{ code: 'minibar', description: 'Mini Bar' },
		{ code: 'safe', description: 'Electronic Safe' },
		{ code: 'shower', description: 'Rain Shower' },
		{ code: 'workspace', description: 'Work Desk' },
		{ code: 'service', description: '24/7 Room Service' },
	];

    // Room Stats Component
    const RoomStats = () => (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y border-gray-100 dark:border-gray-800 my-6">
            <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Occupancy</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                    {room.maxOccupancy ? `${room.maxOccupancy} Guests` : '2 Guests'}
                </p>
            </div>
            <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Bed Type</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                    {room.bedTypes || 'King Size'}
                </p>
            </div>
            <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Room Size</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                    {room.roomSize ? `${room.roomSize} ${room.roomSizeUOM || 'sq ft'}` : '450 sq ft'}
                </p>
            </div>
             <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">View</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                    City View
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
                    
                    {/* Sidebar / Booking Card */}
					<div className="space-y-6">
                         <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800 sticky top-24">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Pricing</h3>
                            <div className="flex items-baseline gap-1 mb-6">
                                <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                                    {room.rate?.currency} {room.rate?.base || 299}
                                </span>
                                <span className="text-gray-500 dark:text-gray-400">/ night</span>
                            </div>

                            <div className="space-y-3">
                                <Button className="w-full" size="md"> Book Now </Button>
                                <Button variant="outline" className="w-full"> Contact Hotel </Button>
                            </div>
                            
                            <p className="text-xs text-center text-gray-500 mt-4">
                                *Prices may vary based on dates and availability.
                            </p>
                         </div>
                    </div>
				</div>
			</ComponentCard>
		</div>
	);
}
