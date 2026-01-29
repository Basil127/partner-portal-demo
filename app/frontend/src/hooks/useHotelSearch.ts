import { useState, useCallback, useEffect } from 'react';
import { getApiHotelsAvailability } from '@/lib/api-client/sdk.gen';

export const useHotelSearch = () => {
	const today = new Date();
	const tomorrow = new Date(today);
	tomorrow.setDate(tomorrow.getDate() + 1);

	const formatDate = (date: Date) => date.toISOString().split('T')[0];

	const [filters, setFilters] = useState({
		arrivalDate: formatDate(today),
		departureDate: formatDate(tomorrow),
		adults: 2,
		children: 0,
		hotelName: '',
		minRate: '',
		maxRate: '',
		country: '',
		city: '',
	});

	const [hotels, setHotels] = useState<any[]>([]);
	const [loading, setLoading] = useState(false);

	const fetchHotels = useCallback(async () => {
		setLoading(true);
		try {
			// In a real app, we'd use the provided hotelCodes. For demo, we might use a default or empty string.
			const response = await getApiHotelsAvailability({
				query: {
					hotelCodes: 'MOV_EG_001', // Placeholder
					arrivalDate: filters.arrivalDate,
					departureDate: filters.departureDate,
					adults: filters.adults,
					children: filters.children,
					minRate: filters.minRate ? Number(filters.minRate) : undefined,
					maxRate: filters.maxRate ? Number(filters.maxRate) : undefined,
				},
			});

			console.log('Hotel Search Response:', response);

			if (response.data && 'roomStays' in response.data) {
				setHotels(response.data.roomStays as any[]);
			} else {
				setHotels([]);
			}
		} catch (error) {
			console.error('Failed to fetch hotels:', error);
			setHotels([]);
		} finally {
			setLoading(false);
		}
	}, [filters]);

	useEffect(() => {
		fetchHotels();
	}, [fetchHotels]);

	const handleFilterChange = (key: string, value: any) => {
		setFilters((prev) => ({ ...prev, [key]: value }));
	};

	return {
		filters,
		hotels,
		loading,
		handleFilterChange,
		fetchHotels,
	};
};
