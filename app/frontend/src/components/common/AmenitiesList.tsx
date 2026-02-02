import React from 'react';
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

// Support both hotel amenities and room amenities
export type Amenity =
	| {
			roomAmenity: string;
			description: string;
			quantity: number;
			includeInRate: boolean;
			confirmable: boolean;
	  }
	| { code?: string; description?: string };

interface AmenitiesListProps {
	amenities: Amenity[];
	title?: string;
	className?: string;
	maxItems?: number;
}

const amenityIcons: Record<string, React.FC<any>> = {
	wifi: WifiIcon,
	gym: BarbelIcon,
	golf: GolfIcon,
	pool: WaterIcon,
	parking: BoxIcon,
	conference: CallIcon,
	spa: CheckCircleIcon,
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

export default function AmenitiesList({
	amenities,
	title,
	className = '',
	maxItems,
}: AmenitiesListProps) {
	if (!amenities || amenities.length === 0) return null;

	const [showMore, setShowMore] = React.useState(false);

	if (!maxItems) maxItems = 8; // default show 8 items
	const totalAmenities = amenities.length;

	if (!showMore && maxItems && amenities.length > maxItems) {
		amenities = amenities.slice(0, maxItems);
	}

	return (
		<div className={className}>
			{title && (
				<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
			)}
			<div className="grid grid-cols-[repeat(auto-fit,minmax(165px,1fr))] gap-4">
				{amenities.map((amenity, index) => {
					// Handle both room amenities and hotel amenities
					const amenityCode = 'roomAmenity' in amenity ? amenity.roomAmenity : amenity.code;
					const amenityDescription = amenity.description;

					const IconComponent = getAmenityIcon(amenityCode);
					return (
						<div
							key={index}
							className="flex items-center gap-2 p-1.5 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
						>
							<div className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-primary-50 dark:bg-primary-900/10 text-primary-500">
								<IconComponent className="w-4 h-4 dark:text-primary-400" />
							</div>
							<span
								className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate"
								title={amenityDescription}
							>
								{amenityDescription}
							</span>
						</div>
					);
				})}
				{totalAmenities > maxItems && (
					<div className="col-span-full flex justify-center mt-2">
						<button
							onClick={() => setShowMore(!showMore)}
							className="text-primary-600 dark:text-primary-400 hover:underline"
						>
							{showMore ? 'Show Less ▲' : 'Show More ▼'}
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
