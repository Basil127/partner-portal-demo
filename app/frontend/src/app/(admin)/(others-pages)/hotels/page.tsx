'use client';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import Badge from '@/components/ui/badge/Badge';
import Button from '@/components/ui/button/Button';
import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import Select from '@/components/form/Select';
import DatePicker from '@/components/form/date-picker';
import { ChevronDownIcon } from '@/icons';
import { getApiHotelsAvailability } from '@/lib/api-client/sdk.gen';
import React, { useState, useEffect, useCallback } from 'react';

// Using a custom search icon
const SearchIcon = () => (
	<svg
		className="fill-current"
		width="20"
		height="20"
		viewBox="0 0 20 20"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
	>
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			d="M8.33331 3.33331C5.57189 3.33331 3.33331 5.57189 3.33331 8.33331C3.33331 11.0947 5.57189 13.3333 8.33331 13.3333C9.55871 13.3333 10.677 12.8944 11.5457 12.1643L14.6905 15.3091C15.0159 15.6346 15.5436 15.6346 15.869 15.3091C16.1945 14.9837 16.1945 14.456 15.869 14.1306L12.7242 10.9858C13.4542 10.1171 13.8889 8.99878 13.8889 7.77775C13.8889 5.01633 11.6503 2.77775 8.88887 2.77775V3.33331H8.33331ZM4.44442 8.33331C4.44442 6.18559 6.18559 4.44442 8.33331 4.44442C10.481 4.44442 12.2222 6.18559 12.2222 8.33331C12.2222 10.481 10.481 12.2222 8.33331 12.2222C6.18559 12.2222 4.44442 10.481 4.44442 8.33331Z"
		/>
	</svg>
);

export default function HotelsPage() {
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

	return (
		<div className="space-y-6">
			<PageBreadcrumb pageTitle="Hotels" />

			<ComponentCard title="Search Filters">
				<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
					<div>
						<DatePicker
							id="arrivalDate"
							label="Arrival Date"
							defaultDate={filters.arrivalDate}
							onChange={(dates: Date[]) => {
								if (dates.length > 0) {
									handleFilterChange('arrivalDate', formatDate(dates[0]));
								}
							}}
						/>
					</div>
					<div>
						<DatePicker
							id="departureDate"
							label="Departure Date"
							defaultDate={filters.departureDate}
							onChange={(dates: Date[]) => {
								if (dates.length > 0) {
									handleFilterChange('departureDate', formatDate(dates[0]));
								}
							}}
						/>
					</div>
					<div>
						<Label htmlFor="adults">Adults</Label>
						<Input
							id="adults"
							type="number"
							min="1"
							defaultValue={filters.adults}
							onChange={(e) => handleFilterChange('adults', Number(e.target.value))}
						/>
					</div>
					<div>
						<Label htmlFor="children">Children</Label>
						<Input
							id="children"
							type="number"
							min="0"
							defaultValue={filters.children}
							onChange={(e) => handleFilterChange('children', Number(e.target.value))}
						/>
					</div>
					<div>
						<Label htmlFor="hotelName">Hotel Name</Label>
						<Input
							id="hotelName"
							placeholder="Enter hotel name"
							defaultValue={filters.hotelName}
							onChange={(e) => handleFilterChange('hotelName', e.target.value)}
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
								onChange={(e) => handleFilterChange('minRate', e.target.value)}
							/>
						</div>
						<div>
							<Label htmlFor="maxRate">Max Rate</Label>
							<Input
								id="maxRate"
								type="number"
								placeholder="Max"
								defaultValue={filters.maxRate}
								onChange={(e) => handleFilterChange('maxRate', e.target.value)}
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
								onChange={(val) => handleFilterChange('country', val)}
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
							onChange={(e) => handleFilterChange('city', e.target.value)}
						/>
					</div>
				</div>
				<div className="flex justify-end mt-4">
					<Button onClick={fetchHotels} startIcon={<SearchIcon />}>
						Search Hotels
					</Button>
				</div>
			</ComponentCard>

			<ComponentCard title="Available Hotels">
				<div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
					<div className="max-w-full overflow-x-auto">
						<Table>
							<TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
								<TableRow>
									<TableCell
										isHeader
										className="px-5 py-3 text-left text-sm font-medium text-gray-500"
									>
										Hotel Name
									</TableCell>
									<TableCell
										isHeader
										className="px-5 py-3 text-left text-sm font-medium text-gray-500"
									>
										Location
									</TableCell>
									<TableCell
										isHeader
										className="px-5 py-3 text-left text-sm font-medium text-gray-500"
									>
										Price per Night
									</TableCell>
									<TableCell
										isHeader
										className="px-5 py-3 text-left text-sm font-medium text-gray-500"
									>
										Status
									</TableCell>
									<TableCell
										isHeader
										className="px-5 py-3 text-right text-sm font-medium text-gray-500"
									>
										Action
									</TableCell>
								</TableRow>
							</TableHeader>
							<TableBody>
								{loading ? (
									<TableRow>
										<TableCell colSpan={5} className="px-5 py-10 text-center text-gray-500">
											Loading hotels...
										</TableCell>
									</TableRow>
								) : hotels.length > 0 ? (
									hotels.map((hotel, index) => (
										<TableRow
											key={index}
											className="border-b border-gray-100 dark:border-white/[0.05]"
										>
											<TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white/90">
												<div className="font-medium">
													{(hotel.basicPropertyInfo as any)?.name || 'Hotel Name'}
												</div>
												<div className="text-xs text-gray-500">
													{(hotel.basicPropertyInfo as any)?.hotelCode || 'CODE'}
												</div>
											</TableCell>
											<TableCell className="px-5 py-4 text-sm text-gray-500">
												{(hotel.basicPropertyInfo as any)?.address?.cityName || 'City'},{' '}
												{(hotel.basicPropertyInfo as any)?.address?.countryCode || 'Country'}
											</TableCell>
											<TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white/90">
												{hotel.total?.amountBeforeTax || '0.00'}{' '}
												{hotel.total?.currencyCode || 'USD'}
											</TableCell>
											<TableCell className="px-5 py-4">
												<Badge color="success" variant="light">
													Available
												</Badge>
											</TableCell>
											<TableCell className="px-5 py-4 text-right">
												<Button size="sm" variant="outline">
													View Offers
												</Button>
											</TableCell>
										</TableRow>
									))
								) : (
									<TableRow>
										<TableCell colSpan={5} className="px-5 py-10 text-center text-gray-500">
											No hotels found matching your criteria.
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</div>
				</div>
			</ComponentCard>
		</div>
	);
}
