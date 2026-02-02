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
import { useBooking } from '@/context/BookingContext';

export default function RoomDetailPage() {
	const params = useParams();
	const hotelId = params?.hotelId as string;
	const roomId = params?.roomId as string;

	const { room: apiRoom, loading } = useRoomDetails(hotelId, roomId);
	const {
		checkIn,
		checkOut,
		adults,
		children,
		pricePerNight,
		setCheckIn,
		setCheckOut,
		setAdults,
		setChildren,
		calculateNights,
		getTotalPrice,
		getTotalWithTax,
	} = useBooking();

	const nights = calculateNights();
	const totalPrice = getTotalPrice();
	const totalWithTax = getTotalWithTax();

	// Mock Room Data for fallback
	const mockRoom: ContentRoomType = {
		hotelRoomType: 'MOCK-001',
		roomType: 'Mock_Deluxe',
		roomName: 'Mock Deluxe Room (Fallback)',
		description: [
			'This is a mock room displayed because the requested room ID was not found or is invalid.',
			'In a production environment, this would handle the error gracefully.',
		],
		roomCategory: 'Deluxe',
		roomViewType: 'City View',
		roomPrimaryBedType: 'King',
		nonSmokingInd: true,
		occupancy: {
			minOccupancy: 1,
			maxOccupancy: 2,
			maxAdults: 2,
			maxChildren: 0,
		},
		numberOfUnits: 1,
		roomAmenities: [
			{
				roomAmenity: 'WIFI',
				description: 'Free Wi-Fi (Mock)',
				quantity: 1,
				includeInRate: true,
				confirmable: false,
			},
			{
				roomAmenity: 'AC',
				description: 'Air Conditioning (Mock)',
				quantity: 1,
				includeInRate: true,
				confirmable: false,
			},
			{
				roomAmenity: 'TV',
				description: 'Smart TV (Mock)',
				quantity: 1,
				includeInRate: true,
				confirmable: false,
			},
		],
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
		{
			roomAmenity: 'WIFI',
			description: 'Free Wi-Fi',
			quantity: 1,
			includeInRate: true,
			confirmable: false,
		},
		{
			roomAmenity: 'TV',
			description: '55" Smart TV',
			quantity: 1,
			includeInRate: true,
			confirmable: false,
		},
		{
			roomAmenity: 'AC',
			description: 'Climate Control',
			quantity: 1,
			includeInRate: true,
			confirmable: false,
		},
		{
			roomAmenity: 'MINIBAR',
			description: 'Mini Bar',
			quantity: 1,
			includeInRate: false,
			confirmable: false,
		},
		{
			roomAmenity: 'SAFE',
			description: 'Electronic Safe',
			quantity: 1,
			includeInRate: true,
			confirmable: false,
		},
		{
			roomAmenity: 'SHOWER',
			description: 'Rain Shower',
			quantity: 1,
			includeInRate: true,
			confirmable: false,
		},
		{
			roomAmenity: 'WORKSPACE',
			description: 'Work Desk',
			quantity: 1,
			includeInRate: true,
			confirmable: false,
		},
		{
			roomAmenity: 'SERVICE',
			description: '24/7 Room Service',
			quantity: 1,
			includeInRate: false,
			confirmable: false,
		},
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

	// Pricing Sidebar Component with booking filters
	const PricingSidebar = () => (
		<div className="lg:sticky lg:top-6">
			<ComponentCard title="Booking Details">
				<div className="space-y-6">
					{/* Booking Filters */}
					<div className="grid grid-cols-2 grid-rows-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
								Check-in
							</label>
							<input
								type="date"
								value={checkIn}
								onChange={(e) => setCheckIn(e.target.value)}
								min={new Date().toISOString().split('T')[0]}
								className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
								Check-out
							</label>
							<input
								type="date"
								value={checkOut}
								onChange={(e) => setCheckOut(e.target.value)}
								min={checkIn}
								className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
							/>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
									Adults
								</label>
								<input
									type="number"
									value={adults}
									onChange={(e) => {
										const val = Math.max(1, parseInt(e.target.value) || 1);
										setAdults(val);
									}}
									min="1"
									max={room.occupancy?.maxAdults || 10}
									className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
									Children
								</label>
								<input
									type="number"
									value={children}
									onChange={(e) => {
										const val = Math.max(0, parseInt(e.target.value) || 0);
										setChildren(val);
									}}
									min="0"
									max={room.occupancy?.maxChildren || 10}
									className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
								/>
							</div>
						</div>
					</div>

					{/* Pricing Section */}
					<div className="pt-6 border-t border-gray-200 dark:border-gray-700">
						<div className="space-y-4">
							<div className="flex items-baseline justify-between">
								<div>
									<div className="text-3xl font-bold text-gray-900 dark:text-white">
										${pricePerNight}
									</div>
									<p className="text-sm text-gray-500 dark:text-gray-400 mt-1">per night</p>
								</div>
								<div className="text-right">
									<p className="text-sm text-gray-600 dark:text-gray-400">
										{nights} {nights === 1 ? 'night' : 'nights'}
									</p>
								</div>
							</div>

							<div className="space-y-2">
								<div className="flex justify-between text-sm">
									<span className="text-gray-600 dark:text-gray-400">Subtotal</span>
									<span className="font-medium text-gray-900 dark:text-white">${totalPrice}</span>
								</div>
								<div className="flex justify-between text-sm pb-4 border-b border-gray-200 dark:border-gray-700">
									<span className="text-gray-600 dark:text-gray-400">Taxes & fees</span>
									<span className="font-medium text-gray-900 dark:text-white">
										${totalWithTax - totalPrice}
									</span>
								</div>
								<div className="flex justify-between items-center pt-2">
									<span className="font-semibold text-gray-900 dark:text-white">Total</span>
									<span className="text-2xl font-bold text-gray-900 dark:text-white">
										${totalWithTax}
									</span>
								</div>
							</div>

							<Button
								variant="primary"
								size="md"
								className="w-full mt-4"
								onClick={() => {
									console.log('Reserve room', {
										hotelId,
										roomId,
										checkIn,
										checkOut,
										adults,
										children,
										totalPrice: totalWithTax,
									});
								}}
							>
								Reserve Room
							</Button>
							<p className="text-xs text-center text-gray-500 dark:text-gray-400">
								You won't be charged yet
							</p>
						</div>
					</div>

					{/* Room Quick Info */}
					<div className="pt-6 border-t border-gray-200 dark:border-gray-700 space-y-2">
						<div className="flex items-center justify-between text-sm">
							<span className="text-gray-600 dark:text-gray-400">Guest Capacity</span>
							<span className="font-medium text-gray-900 dark:text-white">
								{room.occupancy?.maxOccupancy || 2} guests
							</span>
						</div>
						<div className="flex items-center justify-between text-sm">
							<span className="text-gray-600 dark:text-gray-400">Bed Type</span>
							<span className="font-medium text-gray-900 dark:text-white">
								{room.roomPrimaryBedType || 'King'}
							</span>
						</div>
						{room.nonSmokingInd && (
							<div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
								<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
									<path
										fillRule="evenodd"
										d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
										clipRule="evenodd"
									/>
								</svg>
								<span>Non-smoking</span>
							</div>
						)}
					</div>
				</div>
			</ComponentCard>
		</div>
	);

	return (
		<div className="relative space-y-6">
			{/* Mock Room Badge */}
			{isMock && (
				<div className="absolute top-0 right-0 z-20 pointer-events-none">
					<Badge
						color="warning"
						variant="solid"
						className="shadow-lg rounded-bl-xl rounded-tr-none px-4 py-2 text-xs font-bold uppercase tracking-wider"
					>
						Mock Room
					</Badge>
				</div>
			)}

			<ComponentCard title="Room Details">
				<RoomDetailsHeader room={room} />
				<RoomStats />
				<div className="grid gap-8 md:grid-cols-2  mt-8">
					<div className="space-y-8">
						<RoomDescription room={room} />
						<div className="pt-6 border-t border-gray-100 dark:border-gray-800">
							<AmenitiesList amenities={roomAmenities} title="Room Amenities" />
						</div>
					</div>
					<div>
						<PricingSidebar />
					</div>
				</div>
			</ComponentCard>
		</div>
	);
}
