import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { getApiContentHotels } from '@/lib/api-client/sdk.gen';
import type { GetApiContentHotelsResponse } from '@/lib/api-client/types.gen';

// Extract the Hotel type from the API response
type Hotel = NonNullable<GetApiContentHotelsResponse['hotels']>[number];

export const useHotelSearch = () => {
	const today = new Date();
	const tomorrow = new Date(today);
	tomorrow.setDate(tomorrow.getDate() + 1);
	const searchParams = useSearchParams();

	const formatDate = (date: Date) => date.toISOString().split('T')[0];

	// Initialize filters from URL or defaults
	const [filters, setFilters] = useState({
		arrivalDate: searchParams.get('checkIn') || formatDate(today),
		departureDate: searchParams.get('checkOut') || formatDate(tomorrow),
		adults: Number(searchParams.get('adults')) || 2,
		children: Number(searchParams.get('children')) || 0,
		hotelName: '',
		minPrice: Number(searchParams.get('minPrice')) || 0,
		maxPrice: Number(searchParams.get('maxPrice')) || 1000,
		country: '',
		city: '',
	});

	const [hotels, setHotels] = useState<Hotel[]>([]);
	const [loading, setLoading] = useState(false);

	const fetchHotels = useCallback(async () => {
		setLoading(true);
		try {
			const response = await getApiContentHotels();

			console.log('Hotel Content Response:', response);

			if (response.data && 'hotels' in response.data && response.data.hotels) {
				setHotels(response.data.hotels);
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
		setFilters((prev) => {
			const newFilters = { ...prev, [key]: value };

			// Update URL query parameters for date/occupancy filters
			const params = new URLSearchParams();
			if (newFilters.arrivalDate) params.set('checkIn', newFilters.arrivalDate);
			if (newFilters.departureDate) params.set('checkOut', newFilters.departureDate);
			if (newFilters.adults) params.set('adults', String(newFilters.adults));
			if (newFilters.children) params.set('children', String(newFilters.children));
			if (newFilters.minPrice) params.set('minPrice', String(newFilters.minPrice));
			if (newFilters.maxPrice) params.set('maxPrice', String(newFilters.maxPrice));

			return newFilters;
		});
	};

	return {
		filters,
		hotels,
		loading,
		handleFilterChange,
		fetchHotels,
	};
};
