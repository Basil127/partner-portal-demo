'use client';

import React, { useState } from 'react';
import DatePicker from '@/components/form/date-picker';
import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import Select from '@/components/form/Select';
import Button from '@/components/ui/button/Button';
import { ChevronDownIcon, ChevronUpIcon, SearchIcon } from '@/icons/index';

interface HotelFilters {
	arrivalDate: string;
	departureDate: string;
	adults: number;
	children: number;
	hotelName: string;
	minRate: string;
	maxRate: string;
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

	const formatDate = (date: Date) => date.toISOString().split('T')[0];

	const isDateRangeInvalid = new Date(filters.departureDate) <= new Date(filters.arrivalDate);

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
								defaultDate={filters.arrivalDate}
								onChange={(dates: Date[]) => {
									if (dates.length > 0) {
										onFilterChange('arrivalDate', formatDate(dates[0]));
									}
								}}
							/>
						</div>
						<div className="w-full lg:w-44 relative">
							<DatePicker
								id="departureDate"
								mode="single"
								label="Departure Date"
								defaultDate={filters.departureDate}
								error={isDateRangeInvalid}
								onChange={(dates: Date[]) => {
									if (dates.length > 0) {
										onFilterChange('departureDate', formatDate(dates[0]));
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
									defaultValue={filters.adults}
									onChange={(e) => onFilterChange('adults', Number(e.target.value))}
								/>
							</div>
							<div>
								<Label htmlFor="children">Children</Label>
								<Input
									id="children"
									type="number"
									min="0"
									defaultValue={filters.children}
									onChange={(e) => onFilterChange('children', Number(e.target.value))}
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
									defaultValue={filters.minRate}
									onChange={(e) => onFilterChange('minRate', e.target.value)}
								/>
							</div>
							<div>
								<Label htmlFor="maxRate">Max Rate</Label>
								<Input
									id="maxRate"
									type="number"
									placeholder="Max"
									defaultValue={filters.maxRate}
									onChange={(e) => onFilterChange('maxRate', e.target.value)}
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
