from __future__ import annotations

from enum import Enum
from typing import Any

from pydantic import BaseModel


class HotelAvailabilityStatus(str, Enum):
    """Availability status of a hotel."""

    AvailableForSale = "AvailableForSale"
    NoAvailability = "NoAvailability"
    NotFound = "NotFound"
    OtherAvailable = "OtherAvailable"


class Address(BaseModel):
    """Address information."""

    addressLine: list[str] | None = None
    city: str | None = None
    postalCode: str | None = None
    countryCode: str | None = None
    state: str | None = None
    county: str | None = None


class Description(BaseModel):
    """Description text."""

    text: str | None = None


class OfferRatePlanCommission(BaseModel):
    """Commission info for a rate plan."""

    percent: float | None = None
    amount: float | None = None
    currencyCode: str | None = None


class RatePackage(BaseModel):
    """Package associated with a rate."""

    code: str | None = None
    description: str | None = None


class OfferMealPlan(BaseModel):
    """Meal plan details."""

    code: str | None = None
    description: str | None = None


class PromotionCodeItem(BaseModel):
    """Promotion code item."""

    code: str | None = None
    name: str | None = None


class Restriction(BaseModel):
    """Booking restriction."""

    code: str | None = None
    description: str | None = None


class PropertySearchPropertyInfo(BaseModel):
    """Property info for search results."""

    hotelCode: str | None = None
    hotelName: str | None = None
    chainCode: str | None = None
    isAlternate: bool | None = None


class PropertyOffersPropertyInfo(PropertySearchPropertyInfo):
    """Property info for offers, extends search info."""

    address: Address | None = None
    propertyAmenities: list[dict[str, Any]] | None = None
    distance: dict[str, Any] | None = None


class OfferRateMode(BaseModel):
    """Rate mode details."""

    type: str | None = None


class OfferTotalType(BaseModel):
    """The daily rate of the offer."""

    amountBeforeTax: float | None = None
    amountAfterTax: float | None = None
    currencyCode: str | None = None


class OfferTotalTypeWithTaxes(OfferTotalType):
    """Total cost including taxes."""


class OfferMinMaxTotalType(BaseModel):
    """Rate range information."""

    amountBeforeTax: float | None = None
    amountAfterTax: float | None = None
    currencyCode: str | None = None
    rateMode: OfferRateMode | None = None
    isCommissionable: bool | None = None
    hasRateChange: bool | None = None


class PropertySearchRatePlan(BaseModel):
    """Rate plan in search results."""

    ratePlanCode: str | None = None
    ratePlanName: str | None = None
    ratePlanType: str | None = None
    identificationRequired: bool | None = None
    accountId: str | None = None
    availabilityStatus: str | None = None  # Enum/Ref
    additionalDetails: dict[str, Any] | None = None


class PropertySearchRoomStay(BaseModel):
    """Room stay details for property search."""

    propertyInfo: PropertySearchPropertyInfo | None = None
    availability: HotelAvailabilityStatus | None = None
    ratePlans: list[PropertySearchRatePlan] | None = None
    minRate: OfferMinMaxTotalType | None = None
    maxRate: OfferMinMaxTotalType | None = None


class PropertySearchResponse(BaseModel):
    """Response for property search."""

    roomStays: list[PropertySearchRoomStay] | None = None


class PropertyOffersRatePlan(BaseModel):
    """Rate plan details for offers. Combines SearchRatePlan and more."""

    ratePlanCode: str | None = None
    ratePlanName: str | None = None
    ratePlanType: str | None = None
    accessCode: str | None = None
    identificationRequired: bool | None = None
    accountId: str | None = None
    ratePlanLevel: str | None = None
    ratePlanCategory: str | None = None
    gdsDescription: Description | None = None
    commissionable: bool | None = None
    commissionDescription: str | None = None
    commission: OfferRatePlanCommission | None = None
    packages: list[RatePackage] | None = None
    mealPlan: OfferMealPlan | None = None
    promotionCodes: list[PromotionCodeItem] | None = None


class PropertyOffersRoomType(BaseModel):
    """Room type details for offers."""

    roomTypeCode: str | None = None
    roomTypeName: str | None = None
    description: str | None = None
    availabilityStatus: str | None = None  # Ref OfferRoomTypeAvailabilityStatus


class OfferOverallRateInformation(BaseModel):
    """Rate plan information of the offer."""

    rateModeAmount: OfferTotalType | None = None
    # additionalGuestAmounts
    rateMode: OfferRateMode | None = None


class OfferRateInformation(BaseModel):
    """Details on the rate plan of the offer."""

    rate: OfferOverallRateInformation | None = None
    cancellationPolicies: list[dict[str, Any]] | None = None
    guaranteeRequirement: str | None = None
    depositPolicies: list[dict[str, Any]] | None = None


class Offer(BaseModel):
    """Offer details."""

    bookingCode: str | None = None
    offerName: str | None = None
    availabilityStatus: str | None = None
    roomType: str | None = None
    ratePlanCode: str | None = None
    rateChangeDuringStay: bool | None = None
    rateInformation: OfferRateInformation | None = None
    packages: list[RatePackage] | None = None
    total: OfferTotalTypeWithTaxes | None = None
    blockInformation: dict[str, Any] | None = None


class PropertyOffersRoomStay(BaseModel):
    """Room stay details for property offers."""

    propertyInfo: PropertyOffersPropertyInfo | None = None
    availability: HotelAvailabilityStatus | None = None
    restrictions: list[Restriction] | None = None
    roomTypes: list[PropertyOffersRoomType] | None = None
    ratePlans: list[PropertyOffersRatePlan] | None = None
    offers: list[Offer] | None = None


class PropertyOffersResponse(BaseModel):
    """Response for property offers search."""

    roomStays: list[PropertyOffersRoomStay] | None = None


# Offer Details


class GeneralInformation(BaseModel):
    """General property information."""

    checkInTime: str | None = None
    checkOutTime: str | None = None


class Communications(BaseModel):
    """Property communication channels."""

    phone: str | None = None
    email: str | None = None


class Transportation(BaseModel):
    """Transportation services."""

    type: str | None = None
    description: str | None = None


class Direction(BaseModel):
    """Directions to property."""

    propertyDirection: str | None = None


class Location(BaseModel):
    """Geographic location."""

    latitude: float | None = None
    longitude: float | None = None


class OfferDetailsPropertyInfo(PropertyOffersPropertyInfo):
    """Detailed property info for an offer."""

    # Extends PropertyOffersPropertyInfo

    generalInformation: GeneralInformation | None = None
    communications: Communications | None = None
    transportations: list[Transportation] | None = None
    direction: Direction | None = None
    location: Location | None = None


class OfferDetailsRoomType(PropertyOffersRoomType):
    """Detailed room type for an offer."""


class OfferDetailsRatePlan(PropertyOffersRatePlan):
    """Detailed rate plan for an offer."""


class OfferDetailsRoomStay(BaseModel):
    """Detailed room stay for an offer."""

    propertyInfo: OfferDetailsPropertyInfo | None = None
    availability: HotelAvailabilityStatus | None = None
    roomType: OfferDetailsRoomType | None = None
    ratePlan: OfferDetailsRatePlan | None = None
    offer: Offer | None = None


class OfferDetailsResponse(BaseModel):
    """Response for a single offer detail."""

    # The spec say: schema: { $ref: "#/definitions/OfferDetailsResponse" }
    # And OfferDetailsResponse: allOf [ OfferDetailsRoomStay ]
    # So it IS OfferDetailsRoomStay directly or wrapped.
    # In Pydantic we can just inherit or use fields.
    # Since it is allOf, it effectively inherits.

    propertyInfo: OfferDetailsPropertyInfo | None = None
    availability: HotelAvailabilityStatus | None = None
    roomType: OfferDetailsRoomType | None = None
    ratePlan: OfferDetailsRatePlan | None = None
    offer: Offer | None = None
