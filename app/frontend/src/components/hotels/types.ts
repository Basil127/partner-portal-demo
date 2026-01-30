export interface HotelInfo {
	hotelId?: string;
	hotelCode?: string;
	hotelName?: string;
	hotelDescription?: string;
	chainCode?: string;
	address?: {
		addressLine1?: string;
		city?: string;
		state?: string;
		country?: string;
		postalCode?: string;
	};
	contactInfo?: {
		phoneNumber?: string;
		email?: string;
		website?: string;
	};
	propertyAmenities?: Array<{
		code?: string;
		description?: string;
	}>;
	[key: string]: any;
}

export interface Amenity {
	code?: string;
	description?: string;
}
