from datetime import date

from fastapi import APIRouter, Header, Path, Query

from operaclone2.web.api.shop.schema import (
    OfferDetailsResponse,
    PropertyOffersResponse,
    PropertySearchResponse,
)

router = APIRouter()


@router.get("/hotels", response_model=PropertySearchResponse)
async def get_properties(
    # Headers
    authorization: str | None = Header(None, description="Bearer token"),
    x_channel_code: str = Header(..., alias="x-channelCode", description="Channel code"),
    x_app_key: str | None = Header(None, alias="x-app-key", description="Application Key"),
    accept_language: str | None = Header(
        None,
        alias="Accept-Language",
        description="Language preference",
    ),
    x_request_id: str | None = Header(None, alias="x-request-id", description="Unique tracing key"),
    x_originating_application: str | None = Header(
        None,
        alias="x-originating-application",
        description="Originating Application",
    ),
    # Query Parameters
    hotel_codes: str = Query(..., alias="HotelCodes", description="List of Hotel Codes (CSV)"),
    arrival_date: date = Query(..., alias="ArrivalDate", description="Arrival/Check-in Date"),
    arrival_date_to: date | None = Query(
        None,
        alias="ArrivalDateTo",
        description="Arrival/Check-in Date To",
    ),
    departure_date: date = Query(
        ...,
        alias="DepartureDate",
        description="Departure/Check-out Date",
    ),
    adults: int | None = Query(1, alias="Adults", description="Number of adults"),
    children: int | None = Query(0, alias="Children", description="Number of children"),
    children_ages: str | None = Query(
        None,
        alias="ChildrenAges",
        description="List of Age of the children (CSV)",
    ),
    rate_plan_codes: str | None = Query(
        None,
        alias="RatePlanCodes",
        description="List of Rate Plan codes (CSV)",
    ),
    access_code: str | None = Query(None, alias="AccessCode", description="Access code"),
    number_of_units: int | None = Query(1, alias="NumberOfUnits", description="Number of rooms"),
    rate_mode: str | None = Query("Highest", alias="RateMode", description="Rate mode"),
    rate_plan_code_match_only: bool | None = Query(False, alias="RatePlanCodeMatchOnly"),
    rate_plan_type: str | None = Query(None, alias="RatePlanType", description="Rate Plan type"),
    available_only: bool | None = Query(False, alias="AvailableOnly"),
    min_rate: float | None = Query(None, alias="minRate"),
    max_rate: float | None = Query(None, alias="maxRate"),
    alternate_offers: str | None = Query("Always", alias="AlternateOffers"),
    commissionable_status: str | None = Query("Both", alias="CommissionableStatus"),
    promotion_codes: str | None = Query(
        None,
        alias="PromotionCodes",
        description="List of Promotion codes (CSV)",
    ),
) -> PropertySearchResponse | None:
    """
    Search for properties and their rate ranges.

    :param authorization: Bearer token.
    :param x_channel_code: Channel code.
    :param x_app_key: Application Key.
    :param accept_language: Language preference.
    :param x_request_id: Unique tracing key.
    :param x_originating_application: Originating Application.
    :param hotel_codes: List of Hotel Codes (CSV).
    :param arrival_date: Arrival/Check-in Date.
    :param arrival_date_to: Arrival/Check-in Date To.
    :param departure_date: Departure/Check-out Date.
    :param adults: Number of adults.
    :param children: Number of children.
    :param children_ages: List of Age of the children (CSV).
    :param rate_plan_codes: List of Rate Plan codes (CSV).
    :param access_code: Access code.
    :param number_of_units: Number of rooms.
    :param rate_mode: Rate mode.
    :param rate_plan_code_match_only: Only match specified rate plans.
    :param rate_plan_type: Rate Plan type.
    :param available_only: Only return available hotels.
    :param min_rate: Minimum rate.
    :param max_rate: Maximum rate.
    :param alternate_offers: Alternate offers setting.
    :param commissionable_status: Commissionable status.
    :param promotion_codes: List of Promotion codes (CSV).
    :returns: Property search response.
    """


@router.get("/hotels/{hotelCode}/offers", response_model=PropertyOffersResponse)
async def get_property_offers(
    # Path
    hotel_code: str = Path(..., alias="hotelCode", description="Hotel Code"),
    # Headers
    authorization: str | None = Header(None, description="Bearer token"),
    x_channel_code: str = Header(..., alias="x-channelCode", description="Channel code"),
    x_app_key: str | None = Header(None, alias="x-app-key", description="Application Key"),
    accept_language: str | None = Header(
        None,
        alias="Accept-Language",
        description="Language preference",
    ),
    x_request_id: str | None = Header(None, alias="x-request-id", description="Unique tracing key"),
    x_originating_application: str | None = Header(None, alias="x-originating-application"),
    # Query
    arrival_date: date = Query(..., alias="ArrivalDate"),
    departure_date: date = Query(..., alias="DepartureDate"),
    adults: int | None = Query(1, alias="Adults"),
    children: int | None = Query(0, alias="Children"),
    children_ages: str | None = Query(None, alias="ChildrenAges"),  # CSV
    room_types: str | None = Query(None, alias="RoomTypes"),  # CSV
    rate_plan_codes: str | None = Query(None, alias="RatePlanCodes"),  # CSV
    access_code: str | None = Query(None, alias="AccessCode"),
    rate_plan_type: str | None = Query(None, alias="RatePlanType"),
    number_of_units: int | None = Query(None, alias="NumberOfUnits"),
    room_type_match_only: bool | None = Query(None, alias="RoomTypeMatchOnly"),
    rate_plan_code_match_only: bool | None = Query(None, alias="RatePlanCodeMatchOnly"),
    rate_mode: str | None = Query(None, alias="RateMode"),
    room_amenity: str | None = Query(None, alias="RoomAmenity"),
    room_amenity_quantity: int | None = Query(None, alias="RoomAmenityQuantity"),
    include_amenities: bool | None = Query(None, alias="IncludeAmenities"),
    min_rate: float | None = Query(None, alias="minRate"),
    max_rate: float | None = Query(None, alias="maxRate"),
    alternate_offers: str | None = Query(None, alias="AlternateOffers"),
    commissionable_status: str | None = Query(None, alias="CommissionableStatus"),
    promotion_codes: str | None = Query(None, alias="PromotionCodes"),  # CSV
    block_code: str | None = Query(None, alias="BlockCode"),
) -> PropertyOffersResponse | None:
    """
    Get available offers for a property.

    :param hotel_code: Hotel Code.
    :param authorization: Bearer token.
    :param x_channel_code: Channel code.
    :param x_app_key: Application Key.
    :param accept_language: Language preference.
    :param x_request_id: Unique tracing key.
    :param x_originating_application: Originating Application.
    :param arrival_date: Arrival Date.
    :param departure_date: Departure Date.
    :param adults: Adults count.
    :param children: Children count.
    :param children_ages: Children ages CSV.
    :param room_types: Room types CSV.
    :param rate_plan_codes: Rate plan codes CSV.
    :param access_code: Access code.
    :param rate_plan_type: Rate plan type.
    :param number_of_units: Units count.
    :param room_type_match_only: Room type match only.
    :param rate_plan_code_match_only: Rate plan code match only.
    :param rate_mode: Rate mode.
    :param room_amenity: Room amenity.
    :param room_amenity_quantity: Room amenity quantity.
    :param include_amenities: Include amenities.
    :param min_rate: Min rate.
    :param max_rate: Max rate.
    :param alternate_offers: Alternate offers.
    :param commissionable_status: Commissionable status.
    :param promotion_codes: Promotion codes CSV.
    :param block_code: Block code.
    :returns: Property offers response.
    """


@router.get("/hotels/{hotelCode}/offer", response_model=OfferDetailsResponse)
async def get_property_offer(
    # Path
    hotel_code: str = Path(..., alias="hotelCode"),
    # Headers
    authorization: str | None = Header(None),
    x_external_system: str | None = Header(None, alias="x-externalsystem"),
    x_app_key: str | None = Header(None, alias="x-app-key"),
    x_channel_code: str | None = Header(None, alias="x-channelCode"),
    accept_language: str | None = Header(None, alias="Accept-Language"),
    x_request_id: str | None = Header(None, alias="x-request-id"),
    x_originating_application: str | None = Header(None, alias="x-originating-application"),
    # Query
    arrival_date: date = Query(..., alias="ArrivalDate"),
    departure_date: date = Query(..., alias="DepartureDate"),
    adults: int | None = Query(1, alias="Adults"),
    children: int | None = Query(0, alias="Children"),
    children_ages: str | None = Query(None, alias="ChildrenAges"),
    room_type: str | None = Query(None, alias="RoomType"),
    rate_plan_code: str | None = Query(None, alias="RatePlanCode"),
    access_code: str | None = Query(None, alias="AccessCode"),
    rate_mode: str | None = Query(None, alias="RateMode"),
    number_of_units: int | None = Query(None, alias="NumberOfUnits"),
    booking_code: str | None = Query(None, alias="BookingCode"),
    include_amenities: bool | None = Query(None, alias="IncludeAmenities"),
    promotion_codes: str | None = Query(None, alias="PromotionCodes"),
    block_code: str | None = Query(None, alias="BlockCode"),
) -> OfferDetailsResponse | None:
    """
    Get detailed offer information.

    :param hotel_code: Hotel Code.
    :param authorization: Bearer token.
    :param x_external_system: External system code.
    :param x_app_key: Application Key.
    :param x_channel_code: Channel code.
    :param accept_language: Language preference.
    :param x_request_id: Unique tracing key.
    :param x_originating_application: Originating Application.
    :param arrival_date: Arrival date.
    :param departure_date: Departure date.
    :param adults: Adults count.
    :param children: Children count.
    :param children_ages: Children ages.
    :param room_type: Room type.
    :param rate_plan_code: Rate plan code.
    :param access_code: Access code.
    :param rate_mode: Rate mode.
    :param number_of_units: Units count.
    :param booking_code: Booking code.
    :param include_amenities: Include amenities.
    :param promotion_codes: Promotion codes.
    :param block_code: Block code.
    :returns: Offer details response.
    """
