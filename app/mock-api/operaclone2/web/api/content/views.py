import logging
from datetime import datetime

from fastapi import APIRouter, Depends, Header, HTTPException, Path, Query

from operaclone2.errors.exceptions import HotelNotFoundError
from operaclone2.services.content_service import ContentService
from operaclone2.web.api.content.schema import (
    PropertyInfoResponse,
    PropertyInfoSummaryResponse,
    RoomTypesResponse,
)

logger = logging.getLogger(__name__)
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
    limit: int = Query(20, alias="limit"),
    offset: int = Query(0, alias="offset"),
    content_service: ContentService = Depends(),
) -> PropertyInfoSummaryResponse:
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
    :param content_service: Content service instance.
    :returns: Property summary response.
    """
    logger.info(
        "Fetching properties summary. Request ID: %s, Channel: %s",
        x_request_id,
        x_channel_code,
    )

    snippets = await content_service.get_all_properties_summary(
        limit=limit or 20,
        offset=offset or 0,
    )
    total_properties = await content_service.total_properties_count()

    return PropertyInfoSummaryResponse(
        hasMore=total_properties > offset + len(snippets),
        totalResults=total_properties,  # could be implemented with count query
        limit=limit,
        count=len(snippets),
        offset=offset,
        hotels=snippets,
    )


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
    content_service: ContentService = Depends(),
) -> PropertyInfoResponse:
    """
    Get detailed property information.

    :param hotel_code: Hotel Code.
    :param authorization: Bearer token.
    :param x_channel_code: Channel code.
    :param x_app_key: Application Key.
    :param x_request_id: Unique tracing key.
    :param x_originating_application: Originating Application.
    :param content_service: Content service instance.
    :returns: Property info response.
    """
    logger.info(
        "Fetching property details for %s. Request ID: %s",
        hotel_code,
        x_request_id,
    )

    try:
        hotel = await content_service.get_property_details(hotel_code)
    except HotelNotFoundError:
        logger.warning(
            "Hotel %s not found. Request ID: %s",
            hotel_code,
            x_request_id,
        )
        raise HTTPException(status_code=404, detail="Hotel not found") from None

    return content_service.map_hotel_to_detail(hotel)


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
    offset: int | None = Query(0, alias="offset"),
    content_service: ContentService = Depends(),
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
    :param content_service: Content service instance.
    :returns: Room types response.
    """
    logger.info(
        "Fetching room types for %s. Request ID: %s",
        hotel_code,
        x_request_id,
    )

    try:
        room_types, total_count = await content_service.get_room_types(
            hotel_code=hotel_code,
            limit=limit or 20,
            offset=offset or 0,
            room_type_filter=room_type,
            include_room_amenities=include_room_amenities or False,
        )
    except HotelNotFoundError:
        logger.warning(
            "Hotel %s not found during room types fetch. Request ID: %s",
            hotel_code,
            x_request_id,
        )
        raise HTTPException(status_code=404, detail="Hotel not found") from None

    return RoomTypesResponse(
        roomTypes=room_types,
        count=len(room_types),
        hasMore=(offset or 0) + len(room_types) < total_count,
        limit=limit,
        offset=offset,
        totalResults=total_count,
    )
