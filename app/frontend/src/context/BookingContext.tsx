'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface BookingContextType {
	checkIn: string;
	checkOut: string;
	adults: number;
	children: number;
	minPrice?: number;
	maxPrice?: number;
	setCheckIn: (date: string) => void;
	setCheckOut: (date: string) => void;
	setAdults: (count: number) => void;
	setChildren: (count: number) => void;
	setMinPrice: (price: number) => void;
	setMaxPrice: (price: number) => void;
	updateAllFilters: (filters: {
		checkIn: string;
		checkOut: string;
		adults: number;
		children: number;
		minPrice?: number;
		maxPrice?: number;
	}) => void;
	calculateNights: () => number;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children: childrenProp }: { children: ReactNode }) {
	// Initialize with defaults
	const tomorrow = new Date();
	tomorrow.setDate(tomorrow.getDate() + 1);
	const dayAfterTomorrow = new Date();
	dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

	const [checkIn, setCheckIn] = useState(tomorrow.toISOString().split('T')[0]);
	const [checkOut, setCheckOut] = useState(dayAfterTomorrow.toISOString().split('T')[0]);
	const [adults, setAdults] = useState(2);
	const [children, setChildren] = useState(0);
	const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
	const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);

	// Calculate number of nights
	const calculateNights = () => {
		if (!checkIn || !checkOut) return 1;
		const start = new Date(checkIn);
		const end = new Date(checkOut);
		const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
		return nights > 0 ? nights : 1;
	};

	const updateAllFilters = (filters: {
		checkIn: string;
		checkOut: string;
		adults: number;
		children: number;
		minPrice?: number;
		maxPrice?: number;
	}) => {
		setCheckIn(filters.checkIn);
		setCheckOut(filters.checkOut);
		setAdults(filters.adults);
		setChildren(filters.children);
		if (filters.minPrice !== undefined) setMinPrice(filters.minPrice);
		if (filters.maxPrice !== undefined) setMaxPrice(filters.maxPrice);
	};

	return (
		<BookingContext.Provider
			value={{
				checkIn,
				checkOut,
				adults,
				children,
				minPrice,
				maxPrice,
				setCheckIn,
				setCheckOut,
				setAdults,
				setChildren,
				setMinPrice,
				setMaxPrice,
				updateAllFilters,
				calculateNights,
			}}
		>
			{childrenProp}
		</BookingContext.Provider>
	);
}

export function useBooking() {
	const context = useContext(BookingContext);
	if (context === undefined) {
		throw new Error('useBooking must be used within a BookingProvider');
	}
	return context;
}
