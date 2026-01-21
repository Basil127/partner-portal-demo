from datetime import datetime

from fastapi import APIRouter, Header, Path, Query

from operaclone2.web.api.content.schema import (
    PropertyInfoResponse,
    PropertyInfoSummaryResponse,
    RoomTypesResponse,
)

router = APIRouter()


@router.get("/hotels", response_model=PropertyInfoSummaryResponse)
async def get_properties_summary(
    # Headers
    authorization: str | None = Header(None, description="Bearer token"),
    x_channel_code: str = Header(..., alias="x-channelCode", description="Channel code"),
    x_app_key: str | None = Header(None, alias="x-app-key", description="Application Key"),
    x_request_id: str | None = Header(None, alias="x-request-id", description="Unique tracing key"),
    x_originating_application: str | None = Header(
        None,
        alias="x-originating-application",
    ),
    # Query
    connection_status_last_changed_from: datetime | None = Query(
        None,
        alias="connectionStatusLastChangedFrom",
    ),
    connection_status_last_changed_to: datetime | None = Query(
        None,
        alias="connectionStatusLastChangedTo",
    ),
    connection_status: str | None = Query(None, alias="connectionStatus"),
    fetch_instructions: str | None = Query(None, alias="fetchInstructions"),
    limit: int | None = Query(20, alias="limit"),
    offset: int | None = Query(0, alias="offset"),
) -> PropertyInfoSummaryResponse | None:
    """
    Get a summary of properties.

    :param authorization: Bearer token.
    :param x_channel_code: Channel code.
    :param x_app_key: Application Key.
    :param x_request_id: Unique tracing key.
    :param x_originating_application: Originating Application.
    :param connection_status_last_changed_from: Last changed from.
    :param connection_status_last_changed_to: Last changed to.
    :param connection_status: Connection status.
    :param fetch_instructions: Fetch instructions.
    :param limit: Page limit.
    :param offset: Page offset.
    :returns: Property summary response.
    """


@router.get("/hotels/{hotelCode}", response_model=PropertyInfoResponse)
async def get_property_info(
    # Path
    hotel_code: str = Path(..., alias="hotelCode", description="Hotel Code"),
    # Headers
    authorization: str | None = Header(None, description="Bearer token"),
    x_channel_code: str = Header(..., alias="x-channelCode", description="Channel code"),
    x_app_key: str | None = Header(None, alias="x-app-key", description="Application Key"),
    x_request_id: str | None = Header(None, alias="x-request-id", description="Unique tracing key"),
    x_originating_application: str | None = Header(
        None,
        alias="x-originating-application",
    ),
) -> PropertyInfoResponse | None:
    """
    Get detailed property information.

    :param hotel_code: Hotel Code.
    :param authorization: Bearer token.
    :param x_channel_code: Channel code.
    :param x_app_key: Application Key.
    :param x_request_id: Unique tracing key.
    :param x_originating_application: Originating Application.
    :returns: Property info response.
    """


@router.get("/hotels/{hotelCode}/roomTypes", response_model=RoomTypesResponse)
async def get_room_types_info(
    # Path
    hotel_code: str = Path(..., alias="hotelCode", description="Hotel Code"),
    # Headers
    authorization: str | None = Header(None, description="Bearer token"),
    x_channel_code: str = Header(..., alias="x-channelCode", description="Channel code"),
    x_app_key: str | None = Header(None, alias="x-app-key", description="Application Key"),
    x_request_id: str | None = Header(None, alias="x-request-id", description="Unique tracing key"),
    x_originating_application: str | None = Header(
        None,
        alias="x-originating-application",
    ),
    # Query
    include_room_amenities: bool | None = Query(False, alias="includeRoomAmenities"),
    room_type: str | None = Query(None, alias="roomType"),
    limit: int | None = Query(20, alias="limit"),
    offset: int | None = Query(0, offset="offset"),
) -> RoomTypesResponse | None:
    """
    Get room types for a property.

    :param hotel_code: Hotel Code.
    :param authorization: Bearer token.
    :param x_channel_code: Channel code.
    :param x_app_key: Application Key.
    :param x_request_id: Unique tracing key.
    :param x_originating_application: Originating Application.
    :param include_room_amenities: Include room amenities.
    :param room_type: Room type filter.
    :param limit: Page limit.
    :param offset: Page offset.
    :returns: Room types response.
    """
