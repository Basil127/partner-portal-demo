'use client';
import ComponentCard from '@/components/common/ComponentCard';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import Badge from '@/components/ui/badge/Badge';
import Button from '@/components/ui/button/Button';
import React from 'react';
import HotelSearchCard from '@/components/hotels/HotelSearchCard';
import { useHotelSearch } from '@/hooks/useHotelSearch';

export default function HotelsPage() {
	const { filters, hotels, loading, handleFilterChange, fetchHotels } = useHotelSearch();

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
													{(hotel.propertyInfo as any)?.hotelName || 'Hotel Name'}
												</div>
												<div className="text-xs text-gray-500">
													{(hotel.propertyInfo as any)?.hotelCode || 'CODE'}
												</div>
											</TableCell>
											<TableCell className="px-5 py-4 text-sm text-gray-500">
												{(hotel.propertyInfo as any)?.address?.cityName || 'City'},{' '}
												{(hotel.propertyInfo as any)?.address?.countryCode || 'Country'}
											</TableCell>
											<TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white/90">
												{hotel.minRate?.amountBeforeTax || '0.00'}{' '}
												{hotel.minRate?.currencyCode || 'USD'}
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
