'use client';

import type React from 'react';
import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getApiContentHotels } from '@/lib/api-client/sdk.gen';

interface Hotel {
	hotelId?: string;
	hotelCode?: string;
	hotelName?: string;
}

interface HotelContextType {
	selectedHotelId: string | null;
	setSelectedHotelId: (hotelId: string) => void;
	hotels: Hotel[];
	selectedHotel: Hotel | null;
	isLoading: boolean;
}

const STORAGE_KEY = 'selectedHotelId';

const HotelContext = createContext<HotelContextType | undefined>(undefined);

export const HotelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [selectedHotelId, setSelectedHotelIdState] = useState<string | null>(null);
	const [isInitialized, setIsInitialized] = useState(false);

	// Load initial selection from localStorage
	useEffect(() => {
		const saved = localStorage.getItem(STORAGE_KEY);
		if (saved) {
			setSelectedHotelIdState(saved);
		}
		setIsInitialized(true);
	}, []);

	const { data: hotelsData, isLoading } = useQuery({
		queryKey: ['hotels'],
		queryFn: () => getApiContentHotels({ throwOnError: true }),
		staleTime: 60 * 60 * 1000, // 1 hour
	});

	const hotels: Hotel[] = hotelsData?.data?.hotels ?? [];

	// Auto-select first hotel if none is stored or stored one is no longer valid
	useEffect(() => {
		if (!isInitialized || isLoading || hotels.length === 0) return;

		const stored = localStorage.getItem(STORAGE_KEY);
		const isStoredValid =
			stored && hotels.some((h) => h.hotelId === stored || h.hotelCode === stored);

		if (!isStoredValid && hotels[0]) {
			const firstId = hotels[0].hotelId ?? hotels[0].hotelCode ?? null;
			if (firstId) {
				setSelectedHotelIdState(firstId);
				localStorage.setItem(STORAGE_KEY, firstId);
			}
		}
	}, [isInitialized, isLoading, hotels]);

	const setSelectedHotelId = useCallback((hotelId: string) => {
		setSelectedHotelIdState(hotelId);
		localStorage.setItem(STORAGE_KEY, hotelId);
	}, []);

	const selectedHotel =
		hotels.find((h) => h.hotelId === selectedHotelId || h.hotelCode === selectedHotelId) ?? null;

	return (
		<HotelContext.Provider
			value={{ selectedHotelId, setSelectedHotelId, hotels, selectedHotel, isLoading }}
		>
			{children}
		</HotelContext.Provider>
	);
};

export const useHotel = () => {
	const context = useContext(HotelContext);
	if (context === undefined) {
		throw new Error('useHotel must be used within a HotelProvider');
	}
	return context;
};
