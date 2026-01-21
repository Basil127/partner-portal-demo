from __future__ import annotations

from pydantic import BaseModel


class Address(BaseModel):
    """Address information."""

    lines: list[str] | None = None
    city: str | None = None
    postalCode: str | None = None
    countryCode: str | None = None
    state: str | None = None


class PropertyOffersHotelAmenity(BaseModel):
    """Hotel amenity information."""

    code: str | None = None
    description: str | None = None


class OfferPointOfInterest(BaseModel):
    """Point of interest information."""

    name: str | None = None
    distance: float | None = None
    unit: str | None = None


class ContentPropertyInfo(BaseModel):
    """Property information details."""

    hotelId: str | None = None
    enterpriseId: str | None = None
    hotelCode: str | None = None
    hotelName: str | None = None
    hotelDescription: str | None = None
    chainCode: str | None = None
    clusterCode: str | None = None
    address: Address | None = None
    latitude: float | None = None
    longitude: float | None = None
    propertyAmenities: list[PropertyOffersHotelAmenity] | None = None
    pointOfInterest: list[OfferPointOfInterest] | None = None
    marketingMessage: str | None = None
    currencyCode: str | None = None
    primaryLanguage: str | None = None
    totalNumberOfRooms: int | None = None
    petPolicy: str | None = None


class PropertyInfoResponse(BaseModel):
    """Response for property information."""

    propertyInfo: ContentPropertyInfo | None = None


class ContentRoomType(BaseModel):
    """Room type information."""

    hotelRoomType: str | None = None
    roomType: str | None = None
    description: list[str] | None = None
    roomName: str | None = None
    roomCategory: str | None = None


class RoomTypesResponse(BaseModel):
    """Response for room types information."""

    roomTypes: list[ContentRoomType] | None = None
    count: int | None = None
    hasMore: bool | None = None
    limit: int | None = None
    offset: int | None = None
    totalResults: int | None = None


class OfferDetailsPropertyInfoSummary(BaseModel):
    """Summary of property information."""

    hotelId: str | None = None
    hotelCode: str | None = None
    hotelName: str | None = None
    chainCode: str | None = None
    brandCode: str | None = None
    startDate: str | None = None
    endDate: str | None = None
    address: Address | None = None


class PropertyInfoSummaryResponse(BaseModel):
    """Response for property info summary."""

    hasMore: bool | None = None
    totalResults: int | None = None
    limit: int | None = None
    count: int | None = None
    offset: int | None = None
    hotels: list[OfferDetailsPropertyInfoSummary] | None = None
