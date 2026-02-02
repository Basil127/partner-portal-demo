import { useState, useEffect } from 'react';
import { useHotelDetails } from './useHotelDetails';
import type { ContentRoomType as RoomType } from '@partner-portal/backend/api-types';

export const useRoomDetails = (hotelId: string, roomId: string) => {
	const {
		hotelInfo,
		roomTypes,
		loading: hotelLoading,
		error: hotelError,
	} = useHotelDetails(hotelId);
	const [room, setRoom] = useState<RoomType | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (hotelLoading) {
			setLoading(true);
			return;
		}

		if (hotelError) {
			setError(hotelError);
			setLoading(false);
			return;
		}

		if (roomTypes.length > 0) {
			// Find room by roomType code or logical identifier
			// Decoding roomId just in case it was encoded in URL
			const decodedRoomId = decodeURIComponent(roomId);
			const foundRoom = roomTypes.find(
				(r) => r.roomType === decodedRoomId || r.hotelRoomType === decodedRoomId,
			);

			if (foundRoom) {
				setRoom(foundRoom);
				setError(null);
			} else {
				setRoom(null);
				setError('Room not found');
			}
		} else {
			// No rooms returned
			setRoom(null);
			setError('No rooms available for this hotel');
		}
		setLoading(false);
	}, [hotelId, roomId, roomTypes, hotelLoading, hotelError]);

	return { hotelInfo, room, loading, error };
};
