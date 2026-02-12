/**
 * Room content types.
 *
 * These types mirror the Opera PMS ContentRoomType schema
 * (openapi/external/mock-opera.json) and are defined locally
 * so the frontend has no build-time dependency on the backend package.
 */

export interface ContentRoomAmenity {
	roomAmenity: string;
	description: string;
	quantity: number;
	includeInRate: boolean;
	confirmable: boolean;
}

export interface Occupancy {
	minOccupancy?: number | null;
	maxOccupancy?: number | null;
	maxAdults?: number | null;
	maxChildren?: number | null;
}

export interface ContentRoomType {
	hotelRoomType: string | null;
	roomType: string | null;
	description?: Array<string>;
	roomName: string | null;
	roomCategory: string | null;
	roomAmenities?: Array<ContentRoomAmenity>;
	roomViewType: string | null;
	roomPrimaryBedType: string | null;
	nonSmokingInd: boolean | null;
	occupancy?: Occupancy | null;
	numberOfUnits?: number | null;
}
