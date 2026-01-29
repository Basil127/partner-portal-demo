import React from 'react';
import { HotelInfo } from './types';
import ComponentCard from '@/components/common/ComponentCard';
import Badge from '@/components/ui/badge/Badge';
import HotelAmenities from './HotelAmenities';
import CarouselImages from '@/components/ui/images/CarouselImages';

interface HotelDetailsCardProps {
	hotelInfo: HotelInfo;
}

export default function HotelDetailsCard({ hotelInfo }: HotelDetailsCardProps) {
	const address = hotelInfo.address;
	const contactInfo = hotelInfo.contactInfo;
	const propertyAmenities =
		hotelInfo.propertyAmenities && hotelInfo.propertyAmenities.length > 0
			? hotelInfo.propertyAmenities
			: [
					{ code: 'wifi', description: 'Free Wi-Fi' },
					{ code: 'parking', description: 'Free Parking' },
					{ code: 'pool', description: 'Swimming Pool' },
					{ code: 'gym', description: 'Fitness Center' },
					{ code: 'spa', description: 'Spa & Wellness' },
					{ code: 'restaurant', description: 'Restaurant' },
					{ code: 'room-service', description: '24/7 Room Service' },
					{ code: 'air-conditioning', description: 'Air Conditioning' },
				];

	// Mock images if none exist
	const images = hotelInfo.images || [
		{ url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop' },
		{ url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&h=600&fit=crop' },
		{ url: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&h=600&fit=crop' },
		{ url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&h=600&fit=crop' },
		{ url: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&h=600&fit=crop' },
	];

	const TagsAction = (
		<div className="flex flex-wrap items-center gap-2 justify-end">
			<Badge variant="light" color="info">
				{hotelInfo.hotelCode}
			</Badge>
			{hotelInfo.chainCode && (
				<Badge variant="light" color="light">
					{hotelInfo.chainCode}
				</Badge>
			)}
		</div>
	);

	return (
		<ComponentCard title={hotelInfo.hotelName || 'Hotel Details'} action={TagsAction}>
			<div className="grid gap-8 lg:grid-cols-2">
				{/* Left Column: Description & Info */}
				<div className="space-y-6">
					<div>
						<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
							About this property
						</h3>
						<p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
							{hotelInfo.hotelDescription ||
								'Experience luxury and comfort at our beautiful property. Featuring world-class amenities and situated in a prime location, we offer an unforgettable stay for both leisure and business travelers.'}
						</p>

						{address && (
							<div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
								<h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3 uppercase tracking-wider">
									Location & Contact
								</h4>
								<div className="grid sm:grid-cols-2 gap-4">
									<div className="text-sm text-gray-600 dark:text-gray-400">
										{address.addressLine1 && (
											<div className="font-medium text-gray-900 dark:text-white">
												{address.addressLine1}
											</div>
										)}
										<div className="mt-1">
											{address.city}
											{address.city && address.state && ', '}
											{address.state} {address.postalCode}
										</div>
										<div>{address.country}</div>
									</div>

									<div className="space-y-2">
										{contactInfo?.phoneNumber && (
											<div className="flex items-center gap-2 text-sm">
												<span className="text-gray-500 w-12">Tel:</span>
												<a
													href={`tel:${contactInfo.phoneNumber}`}
													className="text-primary-600 hover:text-primary-700 font-medium"
												>
													{contactInfo.phoneNumber}
												</a>
											</div>
										)}
										{contactInfo?.email && (
											<div className="flex items-center gap-2 text-sm">
												<span className="text-gray-500 w-12">Email:</span>
												<a
													href={`mailto:${contactInfo.email}`}
													className="text-primary-600 hover:text-primary-700 font-medium truncate"
												>
													{contactInfo.email}
												</a>
											</div>
										)}
										{contactInfo?.website && (
											<div className="flex items-center gap-2 text-sm">
												<span className="text-gray-500 w-12">Web:</span>
												<a
													href={contactInfo.website}
													target="_blank"
													rel="noreferrer"
													className="text-primary-600 hover:text-primary-700 font-medium truncate"
												>
													Visit
												</a>
											</div>
										)}
									</div>
								</div>
							</div>
						)}
					</div>
				</div>

				{/* Right Column: Carousel */}
				<CarouselImages images={images} />
			</div>

			<HotelAmenities amenities={propertyAmenities} />
		</ComponentCard>
	);
}
