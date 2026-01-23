from __future__ import annotations

from datetime import date, datetime
from typing import Any

from pydantic import BaseModel, ConfigDict


class UniqueID(BaseModel):
    """Unique ID definition."""

    id: str | None = None
    type: str | None = None


class PersonName(BaseModel):
    """Person name definition."""

    givenName: str | None = None
    surname: str | None = None
    nameType: str | None = "Primary"


class Profile(BaseModel):
    """Guest profile definition."""

    customer: dict[str, Any] | None = None
    profileType: str | None = "Guest"


class ProfileInfo(BaseModel):
    """Profile info containing profile details."""

    profileIdList: list[UniqueID] | None = None
    profile: Profile | None = None


class ReservationGuest(BaseModel):
    """Guest associated with a reservation."""

    profileInfo: ProfileInfo | None = None
    primary: bool | None = True


class Guarantee(BaseModel):
    """Reservation guarantee info."""

    guaranteeCode: str | None = None
    shortDescription: str | None = None


class GuestCounts(BaseModel):
    """Guest counts."""

    adults: int | None = 1
    children: int | None = 0


class RateTotal(BaseModel):
    """Rate total definition."""

    amountBeforeTax: float | None = None
    amountAfterTax: float | None = None
    currencyCode: str | None = None


class Rate(BaseModel):
    """Daily rate info."""

    base: RateTotal | None = None
    total: RateTotal | None = None
    start: date | None = None
    end: date | None = None


class RoomRate(BaseModel):
    """Room rate details."""

    total: RateTotal | None = None
    rates: dict[str, list[Rate]] | None = None
    roomType: str | None = None
    ratePlanCode: str | None = None
    start: date | None = None
    end: date | None = None
    guestCounts: GuestCounts | None = None


class RoomStay(BaseModel):
    """Room stay details."""

    arrivalDate: date | None = None
    departureDate: date | None = None
    guarantee: Guarantee | None = None
    roomRates: list[RoomRate] | None = None
    guestCounts: GuestCounts | None = None


class Reservation(BaseModel):
    """Reservation model."""

    reservationIdList: list[UniqueID] | None = None
    roomStay: RoomStay | None = None
    reservationGuests: list[ReservationGuest] | None = None
    hotelId: str | None = None
    reservationStatus: str | None = None
    createDateTime: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


class ReservationListResponse(BaseModel):
    """Response containing a list of reservations."""

    reservations: dict[str, list[Reservation]] | None = None


class ReservationSummary(BaseModel):
    """Simplified reservation summary."""

    reservationId: str | None = None
    confirmationNumber: str | None = None
    guestName: str | None = None
    arrivalDate: date | None = None
    departureDate: date | None = None
    status: str | None = None


class ReservationSummaryResponse(BaseModel):
    """Response containing a list of reservation summaries."""

    reservations: list[ReservationSummary] | None = None


class CreateReservationRequest(BaseModel):
    """Request to create a reservation."""

    reservations: dict[str, list[Reservation]]


class CancelReason(BaseModel):
    """Reason for cancellation."""

    description: str | None = None
    code: str | None = None


class CancelReservationRequest(BaseModel):
    """Request to cancel a reservation."""

    reason: CancelReason | None = None
    reservations: list[dict[str, Any]] | None = None


class CancelReservationDetails(BaseModel):
    """Details of a canceled reservation."""

    reservationIdList: list[UniqueID] | None = None
    cancellationNumber: UniqueID | None = None
    status: str | None = "Cancelled"
