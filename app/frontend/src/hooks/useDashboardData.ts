import { useQuery } from '@tanstack/react-query';
import { getApiHotelsByHotelIdReservationsStatistics } from '@/lib/api-client/sdk.gen';
import { useHotel } from '@/context/HotelContext';

export interface RecentBooking {
	guestName?: string;
	confirmationId?: string;
	arrivalDate?: string;
	departureDate?: string;
	reservationStatus?: string;
	reservationId?: string;
	numberOfRooms?: number;
}

export function useDashboardData() {
	const { selectedHotelId } = useHotel();

	const today = new Date();
	const ninetyDaysAgo = new Date(today);
	ninetyDaysAgo.setDate(today.getDate() - 90);

	const { data, isLoading, error } = useQuery({
		queryKey: ['dashboard-reservations', selectedHotelId],
		queryFn: () =>
			getApiHotelsByHotelIdReservationsStatistics({
				throwOnError: true,
				path: { hotelId: selectedHotelId! },
				query: {
					startDate: ninetyDaysAgo.toISOString().split('T')[0],
					endDate: today.toISOString().split('T')[0],
					limit: 10,
					offset: 0,
				},
			}),
		enabled: !!selectedHotelId,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});

	const recentBookings: RecentBooking[] = data?.data?.checkReservations ?? [];

	return {
		recentBookings,
		isLoading,
		error,
	};
}
