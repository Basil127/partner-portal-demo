from datetime import date
from typing import Annotated

from fastapi import APIRouter, Depends, Path, Query

from operaclone2.services.reservation_service import ReservationService
from operaclone2.web.api.reservation.schema import (
    CancelReservationDetails,
    CancelReservationRequest,
    CreateReservationRequest,
    ReservationListResponse,
    ReservationSummaryResponse,
)

router = APIRouter()


@router.get("/hotels/{hotelId}/reservations", response_model=ReservationListResponse)
async def get_hotel_reservations(
    hotel_id: Annotated[str, Path(alias="hotelId")],
    surname: Annotated[str | None, Query()] = None,
    given_name: Annotated[str | None, Query(alias="givenName")] = None,
    arrival_start_date: Annotated[date | None, Query(alias="arrivalStartDate")] = None,
    arrival_end_date: Annotated[date | None, Query(alias="arrivalEndDate")] = None,
    confirmation_number_list: Annotated[
        list[str] | None, Query(alias="confirmationNumberList")
    ] = None,
    limit: Annotated[int, Query()] = 100,
    offset: Annotated[int, Query()] = 0,
    reservation_service: ReservationService = Depends(),
) -> ReservationListResponse:
    """Get Reservations for a hotel."""
    return await reservation_service.get_reservations(
        hotel_id=hotel_id,
        surname=surname,
        given_name=given_name,
        arrival_start_date=arrival_start_date,
        arrival_end_date=arrival_end_date,
        confirmation_numbers=confirmation_number_list,
        limit=limit,
        offset=offset,
    )


@router.get("/hotels/{hotelId}/reservations/summary", response_model=ReservationSummaryResponse)
async def get_reservations_summary(
    hotel_id: Annotated[str, Path(alias="hotelId")],
    arrival_date: Annotated[date | None, Query(alias="arrivalDate")] = None,
    last_name: Annotated[str | None, Query(alias="lastName")] = None,
    limit: Annotated[int, Query()] = 200,
    offset: Annotated[int, Query()] = 0,
    reservation_service: ReservationService = Depends(),
) -> ReservationSummaryResponse:
    """Get brief summary for Reservations."""
    return await reservation_service.get_reservations_summary(
        hotel_id=hotel_id,
        arrival_date=arrival_date,
        last_name=last_name,
        limit=limit,
        offset=offset,
    )


@router.post("/hotels/{hotelId}/reservations", response_model=ReservationListResponse)
async def create_reservation(
    hotel_id: Annotated[str, Path(alias="hotelId")],
    request: CreateReservationRequest,
    reservation_service: ReservationService = Depends(),
) -> ReservationListResponse:
    """Create Reservation."""
    return await reservation_service.create_reservation(hotel_id=hotel_id, request=request)


@router.put(
    "/hotels/{hotelId}/reservations/{reservationId}",
    response_model=ReservationListResponse,
)
async def update_reservation(
    hotel_id: Annotated[str, Path(alias="hotelId")],
    reservation_id: Annotated[str, Path(alias="reservationId")],
    request: CreateReservationRequest,  # Simplified for update
    reservation_service: ReservationService = Depends(),
) -> ReservationListResponse:
    """Update Reservation by ID."""
    return await reservation_service.update_reservation(
        hotel_id=hotel_id, reservation_id=reservation_id, request=request
    )


@router.post(
    "/hotels/{hotelId}/reservations/{reservationId}/cancellations",
    response_model=CancelReservationDetails,
    status_code=201,
)
async def cancel_reservation(
    hotel_id: Annotated[str, Path(alias="hotelId")],
    reservation_id: Annotated[str, Path(alias="reservationId")],
    request: CancelReservationRequest,
    reservation_service: ReservationService = Depends(),
) -> CancelReservationDetails:
    """Cancel Reservation by ID."""
    return await reservation_service.cancel_reservation(
        hotel_id=hotel_id, reservation_id=reservation_id, request=request
    )
