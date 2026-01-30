import React from 'react';
import { Amenity } from './types';
import AmenitiesList from '@/components/common/AmenitiesList';

interface HotelAmenitiesProps {
	amenities: Amenity[];
}

export default function HotelAmenities({ amenities }: HotelAmenitiesProps) {
	return (
        <AmenitiesList 
            amenities={amenities} 
            title="Property Amenities" 
            className="pt-6 border-t border-gray-200 dark:border-gray-700" 
        />
	);
}
