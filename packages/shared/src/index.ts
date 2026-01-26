export enum BookingStatus {
	PENDING = 'pending',
	CONFIRMED = 'confirmed',
	CANCELLED = 'cancelled',
	COMPLETED = 'completed',
}

export type BookingStatusValue = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Booking {
	id: string;
	partnerId: string;
	customerName: string;
	serviceType: string;
	startDate: string; // ISO string for shared use
	endDate: string;
	status: BookingStatus;
	createdAt: string;
	updatedAt: string;
}

export interface CreateBookingData {
	partnerId: string;
	customerName: string;
	serviceType: string;
	startDate: string;
	endDate: string;
}

export type HotelAvailabilityStatus =
	| 'AvailableForSale'
	| 'NoAvailability'
	| 'NotFound'
	| 'OtherAvailable';

export interface OfferMinMaxTotalType {
	amountBeforeTax?: number | null;
	amountAfterTax?: number | null;
	currencyCode?: string | null;
	rateMode?: {
		type?: string | null;
	} | null;
	isCommissionable?: boolean | null;
	hasRateChange?: boolean | null;
}

export interface PropertySearchPropertyInfo {
	hotelCode?: string | null;
	hotelName?: string | null;
	chainCode?: string | null;
	isAlternate?: boolean | null;
}

export interface PropertySearchRatePlan {
	ratePlanCode?: string | null;
	ratePlanName?: string | null;
	ratePlanType?: string | null;
	identificationRequired?: boolean | null;
	accountId?: string | null;
	availabilityStatus?: string | null;
	additionalDetails?: Record<string, unknown> | null;
}

export interface PropertySearchRoomStay {
	propertyInfo?: PropertySearchPropertyInfo | null;
	availability?: HotelAvailabilityStatus | null;
	ratePlans?: PropertySearchRatePlan[] | null;
	minRate?: OfferMinMaxTotalType | null;
	maxRate?: OfferMinMaxTotalType | null;
}

export interface PropertySearchResponse {
	roomStays?: PropertySearchRoomStay[] | null;
}

export interface HotelAvailabilitySearchQuery {
	hotelCodes: string;
	arrivalDate: string;
	departureDate: string;
	arrivalDateTo?: string | null;
	adults?: number | null;
	children?: number | null;
	childrenAges?: string | null;
	ratePlanCodes?: string | null;
	accessCode?: string | null;
	numberOfUnits?: number | null;
	rateMode?: string | null;
	ratePlanCodeMatchOnly?: boolean | null;
	ratePlanType?: string | null;
	availableOnly?: boolean | null;
	minRate?: number | null;
	maxRate?: number | null;
	alternateOffers?: string | null;
	commissionableStatus?: string | null;
	promotionCodes?: string | null;
}

export interface HotelAvailabilityRequestHeaders {
	channelCode: string;
	authorization?: string;
	appKey?: string;
	acceptLanguage?: string;
	requestId?: string;
	originatingApplication?: string;
}
