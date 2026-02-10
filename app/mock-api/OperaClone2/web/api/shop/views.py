from datetime import date

from fastapi import APIRouter, Depends, Header, Path, Query

from operaclone2.services.shop_service import ShopService
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
    rate_mode: str | None = Query(
        "Highest",
        alias="RateMode",
        description="Rate mode",
    ),
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
    shop_service: ShopService = Depends(),
) -> PropertySearchResponse:
    """
    List the availability status and rate range at multiple properties for given list of properties.

    <p><strong>OperationId:</strong>getProperties</p>
    """
    hotel_codes_list = hotel_codes.split(",") if hotel_codes else []
    return await shop_service.search_properties(
        hotel_codes=hotel_codes_list,
        arrival_date=arrival_date,
        departure_date=departure_date,
    )


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
    shop_service: ShopService = Depends(),
) -> PropertyOffersResponse:
    """
    List available offers for a single property.

    <p><strong>OperationId:</strong>getPropertyOffers</p>
    """
    return await shop_service.get_property_offers(
        hotel_code=hotel_code,
        arrival_date=arrival_date,
        departure_date=departure_date,
    )


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
    shop_service: ShopService = Depends(),
) -> OfferDetailsResponse:
    """
    Retrieve a single offer by room type and rate plan. Or booking code.

    <p><strong>OperationId:</strong>getPropertyOffer</p>
    """
    return await shop_service.get_offer_details(
        hotel_code=hotel_code,
        arrival_date=arrival_date,
        departure_date=departure_date,
    )
