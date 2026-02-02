'use client';

import React, { useState, useEffect } from 'react';
import DatePicker from '@/components/form/date-picker';
import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import Select from '@/components/form/Select';
import Button from '@/components/ui/button/Button';
import { ChevronDownIcon, ChevronUpIcon, SearchIcon } from '@/icons/index';
import { useBooking } from '@/context/BookingContext';

interface HotelFilters {
	arrivalDate: string;
	departureDate: string;
	adults: number;
	children: number;
	hotelName: string;
	minPrice: number;
	maxPrice?: number;
	country: string;
	city: string;
}

interface HotelSearchCardProps {
	filters: HotelFilters;
	onFilterChange: (key: string, value: any) => void;
	onSearch: () => void;
}

export default function HotelSearchCard({
	filters,
	onFilterChange,
	onSearch,
}: HotelSearchCardProps) {
	const [isExpanded, setIsExpanded] = useState(false);
	const {
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
	} = useBooking();

	const formatDate = (date: Date) => date.toISOString().split('T')[0];

	// Sync filters with booking context
	useEffect(() => {
		if (filters.arrivalDate !== checkIn) {
			onFilterChange('arrivalDate', checkIn);
		}
		if (filters.departureDate !== checkOut) {
			onFilterChange('departureDate', checkOut);
		}
		if (filters.adults !== adults) {
			onFilterChange('adults', adults);
		}
		if (filters.children !== children) {
			onFilterChange('children', children);
		}
		if (filters.minPrice !== minPrice) {
			onFilterChange('minPrice', minPrice);
		}
		if (filters.maxPrice !== maxPrice) {
			onFilterChange('maxPrice', maxPrice);
		}
	}, [checkIn, checkOut, adults, children, minPrice, maxPrice]);

	const isDateRangeInvalid = new Date(checkOut) <= new Date(checkIn);

	return (
		<div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3">
			<div className="p-5 sm:p-3">
				<div className="flex flex-wrap items-end justify-between gap-4">
					<div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:flex lg:items-end">
						<div className="w-full lg:w-44">
							<DatePicker
								id="arrivalDate"
								mode="single"
								label="Arrival Date"
								defaultDate={checkIn}
								onChange={(dates: Date[]) => {
									if (dates.length > 0) {
										const newDate = formatDate(dates[0]);
										setCheckIn(newDate);
										onFilterChange('arrivalDate', newDate);
									}
								}}
							/>
						</div>
						<div className="w-full lg:w-44 relative">
							<DatePicker
								id="departureDate"
								mode="single"
								label="Departure Date"
								defaultDate={checkOut}
								error={isDateRangeInvalid}
								onChange={(dates: Date[]) => {
									if (dates.length > 0) {
										const newDate = formatDate(dates[0]);
										setCheckOut(newDate);
										onFilterChange('departureDate', newDate);
									}
								}}
							/>
							{isDateRangeInvalid && (
								<p className="absolute -bottom-5 left-0 text-[10px] text-error-500 font-medium whitespace-nowrap">
									Must be after arrival date
								</p>
							)}
						</div>

						{!isExpanded && (
							<>
								<div className="flex items-center gap-2">
									<Button
										variant="outline"
										size="sm"
										onClick={() => setIsExpanded(true)}
										className="flex items-center gap-2"
									>
										More Filters <ChevronDownIcon className="w-4 h-4" />
									</Button>
								</div>
								<div className="flex items-center gap-2">
									<Button
										onClick={onSearch}
										disabled={isDateRangeInvalid}
										startIcon={<SearchIcon width={20} height={20} />}
									>
										Search
									</Button>
								</div>
							</>
						)}
					</div>

					{isExpanded && (
						<button
							onClick={() => setIsExpanded(false)}
							className="text-sm font-medium text-brand-500 hover:text-brand-600 flex items-center gap-1"
						>
							Less Filters <ChevronUpIcon className="w-4 h-4" />
						</button>
					)}
				</div>

				{isExpanded && (
					<div className="mt-6 grid gap-6 grid-cols-2 lg:grid-cols-4 border-t border-gray-100 dark:border-gray-800 pt-6">
						<div className="grid grid-cols-2 gap-2">
							<div>
								<Label htmlFor="adults">Adults</Label>
								<Input
									id="adults"
									type="number"
									min="1"
									defaultValue={adults}
									onChange={(e) => {
										const newAdults = Number(e.target.value);
										setAdults(newAdults);
										onFilterChange('adults', newAdults);
									}}
								/>
							</div>
							<div>
								<Label htmlFor="children">Children</Label>
								<Input
									id="children"
									type="number"
									min="0"
									defaultValue={children}
									onChange={(e) => {
										const newChildren = Number(e.target.value);
										setChildren(newChildren);
										onFilterChange('children', newChildren);
									}}
								/>
							</div>
						</div>
						<div>
							<Label htmlFor="hotelName">Hotel Name</Label>
							<Input
								id="hotelName"
								placeholder="Enter hotel name"
								defaultValue={filters.hotelName}
								onChange={(e) => onFilterChange('hotelName', e.target.value)}
							/>
						</div>
						<div className="grid grid-cols-2 gap-2">
							<div>
								<Label htmlFor="minRate">Min Rate</Label>
								<Input
									id="minRate"
									type="number"
									placeholder="Min"
									defaultValue={minPrice}
									onChange={(e) => {
										const newMinPrice = Number(e.target.value);
										setMinPrice(newMinPrice);
										onFilterChange('minPrice', newMinPrice);
									}}
								/>
							</div>
							<div>
								<Label htmlFor="maxRate">Max Rate</Label>
								<Input
									id="maxRate"
									type="number"
									placeholder="Max"
									defaultValue={maxPrice}
									onChange={(e) => {
										const newMaxPrice = Number(e.target.value);
										setMaxPrice(newMaxPrice);
										onFilterChange('maxPrice', newMaxPrice);
									}}
								/>
							</div>
						</div>
						<div>
							<Label htmlFor="country">Country</Label>
							<div className="relative">
								<Select
									options={[
										{ value: 'US', label: 'United States' },
										{ value: 'UK', label: 'United Kingdom' },
										{ value: 'FR', label: 'France' },
									]}
									placeholder="Select Country"
									onChange={(val) => onFilterChange('country', val)}
								/>
								<span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
									<ChevronDownIcon />
								</span>
							</div>
						</div>
						<div>
							<Label htmlFor="city">City</Label>
							<Input
								id="city"
								placeholder="Enter city"
								defaultValue={filters.city}
								onChange={(e) => onFilterChange('city', e.target.value)}
							/>
						</div>
						<div className="flex justify-end items-end lg:col-start-4">
							<Button
								onClick={onSearch}
								disabled={isDateRangeInvalid}
								startIcon={<SearchIcon width={20} height={20} />}
								className="w-full sm:w-auto"
							>
								Search Hotels
							</Button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
