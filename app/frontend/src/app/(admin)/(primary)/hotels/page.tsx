'use client';
import ComponentCard from '@/components/common/ComponentCard';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import Badge from '@/components/ui/badge/Badge';
import Button from '@/components/ui/button/Button';
import { getApiHotelsAvailability } from '@/lib/api-client/sdk.gen';
import React, { useState, useEffect, useCallback } from 'react';
import HotelSearchCard from '@/components/hotels/HotelSearchCard';

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
			<HotelSearchCard
				filters={filters}
				onFilterChange={handleFilterChange}
				onSearch={fetchHotels}
			/>

			<ComponentCard title="Available Hotels">
				<div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3">
					<div className="max-w-full overflow-x-auto">
						<Table>
							<TableHeader className="border-b border-gray-100 dark:border-white/5">
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
										<TableRow key={index} className="border-b border-gray-100 dark:border-white/5">
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
