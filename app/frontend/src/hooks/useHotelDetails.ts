import { useState, useEffect } from 'react';
import {
	getApiContentHotelsByHotelCode,
	getApiContentHotelsByHotelCodeRoomTypes,
} from '@/lib/api-client/sdk.gen';
import { HotelInfo, RoomType } from '@/components/hotels/types';

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

			if (hotelResponse.data?.propertyInfo) {
				setHotelInfo(hotelResponse.data.propertyInfo as HotelInfo);
			}

			// Fetch room types
			const roomsResponse = await getApiContentHotelsByHotelCodeRoomTypes({
				path: { hotelCode: hotelId },
				query: { includeRoomAmenities: true },
			});

			if (roomsResponse.data?.roomTypes && roomsResponse.data.roomTypes.length > 0) {
				setRoomTypes(roomsResponse.data.roomTypes as RoomType[]);
			} else {
				// If no room data from API, add sample rooms for demonstration
				setRoomTypes([
					{
						roomType: 'DELUXE',
						roomName: 'Deluxe Room',
						roomDescription: 'Spacious room with king bed and sea view',
						maxOccupancy: 2,
						maxAdults: 2,
						maxChildren: 0,
						bedTypes: 'King Bed',
						roomSize: 35,
						roomSizeUOM: 'sqm',
						images: [
							{
								url: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&h=600&fit=crop',
							},
						],
						rate: { base: 150, currency: 'USD' },
					},
					{
						roomType: 'SUITE',
						roomName: 'Executive Suite',
						roomDescription: 'Luxurious suite with separate living area and panoramic views',
						maxOccupancy: 4,
						maxAdults: 2,
						maxChildren: 2,
						bedTypes: 'King Bed + Sofa Bed',
						roomSize: 60,
						roomSizeUOM: 'sqm',
						images: [
							{
								url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop',
							},
						],
						rate: { base: 280, currency: 'USD' },
					},
					{
						roomType: 'FAMILY',
						roomName: 'Family Room',
						roomDescription: 'Perfect for families with two bedrooms and connecting spaces',
						maxOccupancy: 5,
						maxAdults: 2,
						maxChildren: 3,
						bedTypes: '2 Queen Beds',
						roomSize: 45,
						roomSizeUOM: 'sqm',
						images: [
							{
								url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=600&fit=crop',
							},
						],
						rate: { base: 200, currency: 'USD' },
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
