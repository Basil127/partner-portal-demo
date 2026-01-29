import { useState, useCallback, useEffect } from 'react';
import { getApiContentHotels } from '@/lib/api-client/sdk.gen';

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
			const response = await getApiContentHotels();

			console.log('Hotel Content Response:', response);

			if (response.data && 'hotels' in response.data) {
				setHotels(response.data.hotels as any[]);
			} else {
				setHotels([]);
			}
		} catch (error) {
			console.error('Failed to fetch hotels:', error);
			setHotels([]);
		} finally {
			setLoading(false);
		}
	}, []); // filters are not used in content api fetch, but we keep them for the search bar state

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
