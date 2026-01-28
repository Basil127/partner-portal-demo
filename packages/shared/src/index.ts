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

export interface HotelShopRequestHeaders {
	channelCode: string;
	authorization?: string;
	appKey?: string;
	acceptLanguage?: string;
	requestId?: string;
	originatingApplication?: string;
	externalSystem?: string;
}

export interface HotelPropertyOffersSearchQuery {
	hotelCode: string;
	arrivalDate: string;
	departureDate: string;
	adults?: number | null;
	children?: number | null;
	childrenAges?: string | null;
	roomTypes?: string | null;
	ratePlanCodes?: string | null;
	accessCode?: string | null;
	ratePlanType?: string | null;
	numberOfUnits?: number | null;
	roomTypeMatchOnly?: boolean | null;
	ratePlanCodeMatchOnly?: boolean | null;
	rateMode?: string | null;
	roomAmenity?: string | null;
	roomAmenityQuantity?: number | null;
	includeAmenities?: boolean | null;
	minRate?: number | null;
	maxRate?: number | null;
	alternateOffers?: string | null;
	commissionableStatus?: string | null;
	promotionCodes?: string | null;
	blockCode?: string | null;
}

export interface HotelPropertyOfferQuery {
	hotelCode: string;
	arrivalDate: string;
	departureDate: string;
	adults?: number | null;
	children?: number | null;
	childrenAges?: string | null;
	roomType?: string | null;
	ratePlanCode?: string | null;
	accessCode?: string | null;
	rateMode?: string | null;
	numberOfUnits?: number | null;
	bookingCode?: string | null;
	includeAmenities?: boolean | null;
	promotionCodes?: string | null;
	blockCode?: string | null;
}

export interface PropertyOffersRoomStay {
	propertyInfo?: PropertySearchPropertyInfo | null;
	availability?: HotelAvailabilityStatus | null;
	restrictions?: Array<Record<string, unknown>> | null;
	roomTypes?: Array<Record<string, unknown>> | null;
	ratePlans?: Array<Record<string, unknown>> | null;
	offers?: Array<Record<string, unknown>> | null;
}

export interface PropertyOffersResponse {
	roomStays?: PropertyOffersRoomStay[] | null;
}

export interface OfferDetailsResponse {
	propertyInfo?: PropertySearchPropertyInfo | null;
	availability?: HotelAvailabilityStatus | null;
	roomType?: Record<string, unknown> | null;
	ratePlan?: Record<string, unknown> | null;
	offer?: Record<string, unknown> | null;
}

export interface HotelContentRequestHeaders {
	channelCode: string;
	authorization?: string;
	appKey?: string;
	requestId?: string;
	originatingApplication?: string;
}

export interface PropertiesSummaryQuery {
	connectionStatusLastChangedFrom?: string | null;
	connectionStatusLastChangedTo?: string | null;
	connectionStatus?: string | null;
	fetchInstructions?: string | null;
	limit?: number;
	offset?: number;
}

export interface PropertySnippet {
	hotelId?: string | null;
	hotelCode?: string | null;
	hotelName?: string | null;
	hotelDescription?: string | null;
	address?: Record<string, any> | null;
	coordinates?: Record<string, any> | null;
	connectivity?: Record<string, any> | null;
	meta?: Record<string, any> | null;
}

export interface PropertyInfoSummaryResponse {
	hasMore?: boolean;
	totalResults?: number | null;
	limit?: number;
	count?: number;
	offset?: number;
	hotels?: PropertySnippet[];
}

export interface ContentPropertyInfo {
	hotelId?: string | null;
	enterpriseId?: string | null;
	hotelCode?: string | null;
	hotelName?: string | null;
	hotelDescription?: string | null;
	chainCode?: string | null;
	clusterCode?: string | null;
	address?: Record<string, any> | null;
	latitude?: number | null;
	longitude?: number | null;
	propertyAmenities?: any[] | null;
	pointOfInterest?: any[] | null;
	marketingMessage?: string | null;
	currencyCode?: string | null;
	primaryLanguage?: string | null;
	totalNumberOfRooms?: number | null;
	petPolicy?: string | null;
}

export interface PropertyInfoResponse {
	propertyInfo?: ContentPropertyInfo | null;
}

export interface RoomTypesQuery {
	includeRoomAmenities?: boolean | null;
	roomType?: string | null;
	limit?: number | null;
	offset?: number | null;
}

export interface ContentRoomType {
	hotelRoomType?: string | null;
	roomType?: string | null;
	description?: string[] | null;
	roomName?: string | null;
	roomCategory?: string | null;
	roomAmenities?: any[] | null;
	roomViewType?: string | null;
	roomPrimaryBedType?: string | null;
	nonSmokingInd?: boolean | null;
	occupancy?: Record<string, any> | null;
	numberOfUnits?: number | null;
}

export interface RoomTypesResponse {
	roomTypes?: ContentRoomType[] | null;
	count?: number | null;
	hasMore?: boolean | null;
	limit?: number | null;
	offset?: number | null;
	totalResults?: number | null;
}

// Reservation types matching the mock-opera API structure
export interface UniqueId {
	id?: string | null;
	type?: string | null;
}

export interface RoomRateAmount {
	amountBeforeTax?: number | null;
	amountAfterTax?: number | null;
	currencyCode?: string | null;
}

export interface RoomRate {
	start?: string | null;
	end?: string | null;
	roomType?: string | null;
	ratePlanCode?: string | null;
	total?: RoomRateAmount | null;
}

export interface GuestCount {
	ageQualifyingCode?: string | null;
	count?: number | null;
}

export interface Guarantee {
	guaranteeCode?: string | null;
	shortDescription?: string | null;
}

export interface RoomStay {
	arrivalDate?: string | null;
	departureDate?: string | null;
	guarantee?: Guarantee | null;
	roomRates?: RoomRate[] | null;
	guestCounts?: GuestCount[] | null;
}

export interface PersonName {
	givenName?: string | null;
	surname?: string | null;
}

export interface Customer {
	personName?: PersonName[] | null;
}

export interface Profile {
	customer?: Customer | null;
	profileType?: string | null;
}

export interface ProfileInfo {
	profileIdList?: UniqueId[] | null;
	profile?: Profile | null;
}

export interface ReservationGuest {
	profileInfo?: ProfileInfo | null;
	primary?: boolean | null;
}

export interface Reservation {
	reservationIdList?: UniqueId[] | null;
	roomStay?: RoomStay | null;
	reservationGuests?: ReservationGuest[] | null;
	hotelId?: string | null;
	reservationStatus?: string | null;
	createDateTime?: string | null;
}

export interface ReservationCollection {
	reservation?: Reservation[] | null;
}

export interface ReservationListResponse {
	reservations?: ReservationCollection | null;
}

export interface ReservationSummaryResponse {
	reservations?: any[] | null;
	count?: number | null;
	hasMore?: boolean | null;
	limit?: number | null;
	offset?: number | null;
	totalResults?: number | null;
}

export interface CheckDistributionReservationsSummary {
	statistics?: any[] | null;
	count?: number | null;
	hasMore?: boolean | null;
	limit?: number | null;
	offset?: number | null;
	totalResults?: number | null;
}

export interface CancelReservationDetails {
	cancellationNumber?: string | null;
	status?: string | null;
}

export interface CreateReservationRequest {
	[key: string]: any;
}

export interface CancelReservationRequest {
	reason?: {
		description?: string | null;
		code?: string | null;
	} | null;
	reservations?: Array<Record<string, any>> | null;
}

export interface HotelReservationsRequestHeaders {
	channelCode: string;
	authorization?: string;
	appKey?: string;
	requestId?: string;
	originatingApplication?: string;
}

export interface GetHotelReservationsQuery {
	surname?: string | null;
	givenName?: string | null;
	arrivalStartDate?: string | null;
	arrivalEndDate?: string | null;
	confirmationNumberList?: string[] | null;
	limit?: number;
	offset?: number;
}

export interface GetReservationsSummaryQuery {
	arrivalDate?: string | null;
	lastName?: string | null;
	limit?: number;
	offset?: number;
}

export interface GetReservationStatisticsQuery {
	startDate?: string | null;
	endDate?: string | null;
	limit?: number;
	offset?: number;
}

// ============================================
// Hotel Inventory Types
// ============================================

/**
 * Report code types for inventory statistics.
 * Each ReportCode corresponds to a set of category summaries based upon a predetermined agreement.
 */
export type InventoryReportCode =
	| 'DetailedAvailabiltySummary'
	| 'RoomCalendarStatistics'
	| 'SellLimitSummary'
	| 'RoomsAvailabilitySummary';

/**
 * Request headers for hotel inventory API calls.
 */
export interface HotelInventoryRequestHeaders {
	/** Channel code for the distribution channel */
	channelCode: string;
	/** Bearer authorization token */
	authorization?: string;
	/** Application key for API access */
	appKey?: string;
	/** Language preference for the response */
	acceptLanguage?: string;
	/** Unique request tracing ID */
	requestId?: string;
	/** Identifier for the originating application */
	originatingApplication?: string;
}

/**
 * Query parameters for fetching hotel inventory statistics.
 */
export interface InventoryStatisticsQuery {
	/** Unique ID of the hotel where inventory statistics are searched */
	hotelId: string;
	/** The starting value of the date range (YYYY-MM-DD format) */
	dateRangeStart: string;
	/** The ending value of the date range (YYYY-MM-DD format) */
	dateRangeEnd: string;
	/** Identifies the type of statistics collected */
	reportCode: InventoryReportCode;
	/** Optional parameter names for filtering */
	parameterName?: string[] | null;
	/** Optional parameter values for filtering */
	parameterValue?: string[] | null;
}

/**
 * Revenue category summary for a statistic.
 */
export interface RevenueCategorySummary {
	/** Revenue category code */
	categoryCode?: string | null;
	/** Revenue category description */
	description?: string | null;
	/** Revenue amount value */
	amount?: number | null;
	/** Currency code for the revenue amount */
	currencyCode?: string | null;
}

/**
 * Numeric/inventory category summary for a statistic.
 */
export interface NumericCategorySummary {
	/** Category code for the numeric value */
	categoryCode?: string | null;
	/** Category description */
	description?: string | null;
	/** Numeric value for this category */
	value?: number | null;
}

/**
 * An instance of a statistic containing revenue and inventory summaries.
 */
export interface StatisticSet {
	/** Collection of revenue category summaries */
	revenue?: RevenueCategorySummary[] | null;
	/** Collection of inventory/count category summaries */
	inventory?: NumericCategorySummary[] | null;
	/** Date of the statistic (YYYY-MM-DD format) */
	statisticDate?: string | null;
	/** Whether this statistic date is a weekend date */
	weekendDate?: boolean | null;
}

/**
 * Defines the codes and corresponding categories for statistics.
 */
export interface StatisticCode {
	/** Collection of statistic summary data by date */
	statisticDate?: StatisticSet[] | null;
	/** Actual code used by the system to collect statistics */
	statCode?: string | null;
	/** Category code of the stat code (e.g., Market Segment) */
	statCategoryCode?: string | null;
	/** Class grouping of the stat code */
	statCodeClass?: string | null;
	/** Description of the statistic code */
	description?: string | null;
}

/**
 * Defines all details needed to create a statistical report.
 */
export interface InventoryStatistic {
	/** Collection of statistic codes */
	statistics?: StatisticCode[] | null;
	/** Name of the hotel */
	hotelName?: string | null;
	/** Type of statistics collected */
	reportCode?: string | null;
	/** Description with revenue amount data */
	description?: string | null;
}

/**
 * Response containing an array of inventory statistics.
 */
export type InventoryStatisticsResponse = InventoryStatistic[];
