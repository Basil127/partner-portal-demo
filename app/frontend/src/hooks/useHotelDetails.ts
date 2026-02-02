import { useState, useEffect } from 'react';
import {
	getApiContentHotelsByHotelCode,
	getApiContentHotelsByHotelCodeRoomTypes,
} from '@/lib/api-client';
import { HotelInfo } from '@/components/hotels/types';
import type { ContentRoomType as RoomType } from '@partner-portal/backend/api-types';

export const useHotelDetails = (hotelId: string) => {
	const [hotelInfo, setHotelInfo] = useState<HotelInfo | null>(null);
	const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (hotelId) {
			fetchHotelData();
		}
	}, [hotelId]);

	const fetchHotelData = async () => {
		setLoading(true);
		setError(null);
		try {
			// Fetch hotel details
			const hotelResponse = await getApiContentHotelsByHotelCode({
				path: { hotelCode: hotelId },
			});
			console.log('Hotel Details Response:', hotelResponse);
			if (hotelResponse.data?.propertyInfo) {
				setHotelInfo(hotelResponse.data.propertyInfo as HotelInfo);
			}

			// Fetch room types
			const roomsResponse = await getApiContentHotelsByHotelCodeRoomTypes({
				path: { hotelCode: hotelId },
				query: { includeRoomAmenities: true },
			});

			if (roomsResponse.data?.roomTypes && roomsResponse.data.roomTypes.length > 0) {
				console.log('Room Types Responses:', roomsResponse);
				setRoomTypes(roomsResponse.data.roomTypes as RoomType[]);
			} else {
				// If no room data from API, add sample rooms for demonstration
				setRoomTypes([
					{
						hotelRoomType: 'DLX',
						roomType: 'DELUXE',
						roomName: 'Deluxe Room',
						description: ['Spacious room with king bed and sea view'],
						roomCategory: 'Deluxe',
						roomViewType: 'Sea View',
						roomPrimaryBedType: 'King',
						nonSmokingInd: true,
						occupancy: {
							minOccupancy: 1,
							maxOccupancy: 2,
							maxAdults: 2,
							maxChildren: 0,
						},
						numberOfUnits: 10,
					},
					{
						hotelRoomType: 'STE',
						roomType: 'SUITE',
						roomName: 'Executive Suite',
						description: ['Luxurious suite with separate living area and panoramic views'],
						roomCategory: 'Suite',
						roomViewType: 'Panoramic',
						roomPrimaryBedType: 'King',
						nonSmokingInd: true,
						occupancy: {
							minOccupancy: 1,
							maxOccupancy: 4,
							maxAdults: 2,
							maxChildren: 2,
						},
						numberOfUnits: 5,
					},
					{
						hotelRoomType: 'FAM',
						roomType: 'FAMILY',
						roomName: 'Family Room',
						description: ['Perfect for families with two bedrooms and connecting spaces'],
						roomCategory: 'Family',
						roomViewType: 'Garden View',
						roomPrimaryBedType: 'Twin',
						nonSmokingInd: true,
						occupancy: {
							minOccupancy: 2,
							maxOccupancy: 5,
							maxAdults: 2,
							maxChildren: 3,
						},
						numberOfUnits: 8,
					},
				]);
			}
		} catch (err) {
			console.error('Failed to fetch hotel data:', err);
			setError('Failed to load hotel information');
		} finally {
			setLoading(false);
		}
	};

	return {
		hotelInfo,
		roomTypes,
		loading,
		error,
		refetch: fetchHotelData,
	};
};
