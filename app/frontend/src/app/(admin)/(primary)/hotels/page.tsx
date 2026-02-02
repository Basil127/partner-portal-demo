'use client';
import ComponentCard from '@/components/common/ComponentCard';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import Badge from '@/components/ui/badge/Badge';
import Button from '@/components/ui/button/Button';
import React from 'react';
import HotelSearchCard from '@/components/hotels/HotelSearchCard';
import { useHotelSearch } from '@/hooks/useHotelSearch';
// import { useBooking } from '@/context/BookingContext';

export default function HotelsPage() {
	const { filters, hotels, loading, handleFilterChange, fetchHotels } = useHotelSearch();
	// const { checkIn, checkOut, adults, children, minPrice, maxPrice } = useBooking();

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
									hotels.map((hotel, index) => {
										// Updated for getApiContentHotels structure
										const hotelName = hotel.hotelName || 'Hotel Name';
										const hotelCode = hotel.hotelCode || 'CODE';

										// Fallback for address if it's not in the content API response yet
										const address = hotel.address || { city: 'Unknown', countryCode: 'NA' };

										const cityName = address?.city || 'City';
										const countryName = address?.countryCode || 'Country';

										const detailsLink = `/hotels/${hotelCode}`;

										return (
											<TableRow
												key={index}
												className="border-b border-gray-100 dark:border-white/5"
											>
												<TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white/90">
													<Link
														href={detailsLink}
														className="block hover:text-brand-500 hover:underline"
													>
														<div className="font-medium">{hotelName}</div>
														<div className="text-xs text-gray-500">{hotelCode}</div>
													</Link>
												</TableCell>
												<TableCell className="px-5 py-4 text-sm text-gray-500">
													{cityName}, {countryName}
												</TableCell>
												<TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white/90">
													{/* Price not available in content list */}
													<span className="text-gray-400 text-xs">View for rates</span>
												</TableCell>
												<TableCell className="px-5 py-4">
													<Badge color="info" variant="light">
														Active
													</Badge>
												</TableCell>
												<TableCell className="px-5 py-4 text-right">
													<Link href={detailsLink}>
														<Button size="sm" variant="outline">
															View Details
														</Button>
													</Link>
												</TableCell>
											</TableRow>
										);
									})
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
