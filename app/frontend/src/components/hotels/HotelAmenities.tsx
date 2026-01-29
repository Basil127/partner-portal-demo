import React from 'react';
import { Amenity } from './types';
import {
	CheckCircleIcon,
	WifiIcon,
	BarbelIcon,
	GolfIcon,
	WaterIcon,
	BoxIcon,
	CallIcon,
	DollarLineIcon,
	CalenderIcon,
} from '@/icons/index';

interface HotelAmenitiesProps {
	amenities: Amenity[];
}

const amenityIcons: Record<string, React.FC<any>> = {
	wifi: WifiIcon,
	gym: BarbelIcon,
	golf: GolfIcon,
	pool: WaterIcon,
	parking: BoxIcon,
	conference: CallIcon,
	spa: CheckCircleIcon, // Using generic check for spa as specific icon wasn't in original list? User used CheckCircleIcon.
	restaurant: DollarLineIcon,
	'room-service': CalenderIcon,
	'air-conditioning': CheckCircleIcon,
	default: CheckCircleIcon,
};

const getAmenityIcon = (amenityCode?: string) => {
	if (!amenityCode) return amenityIcons.default;
	const code = amenityCode.toLowerCase();
	for (const key in amenityIcons) {
		if (code.includes(key)) {
			return amenityIcons[key];
		}
	}
	return amenityIcons.default;
};

export default function HotelAmenities({ amenities }: HotelAmenitiesProps) {
	if (!amenities || amenities.length === 0) return null;

	return (
		<div className="pt-6 border-t border-gray-200 dark:border-gray-700">
			<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
				Property Amenities
			</h3>
			<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-2">
				{amenities.map((amenity, index) => {
					const IconComponent = getAmenityIcon(amenity.code);
					return (
						<div
							key={index}
							className="flex items-center gap-2 p-1.5 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
						>
							<div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-primary-50 dark:bg-primary-900/10 text-primary-500">
								<IconComponent className="w-4 h-4 dark:text-primary-400" />
							</div>
							<span
								className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate"
								title={amenity.description || amenity.code}
							>
								{amenity.description || amenity.code}
							</span>
						</div>
					);
				})}
			</div>
		</div>
	);
}
