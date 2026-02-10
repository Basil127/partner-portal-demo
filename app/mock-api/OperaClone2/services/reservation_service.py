from datetime import date, datetime
from typing import Any
from uuid import uuid4

from fastapi import Depends

from operaclone2.db.dao.reservation_dao import ReservationDAO
from operaclone2.web.api.reservation.schema import (
    CancelReservationDetails,
    CancelReservationRequest,
    CheckDistributionReservationsSummary,
    CreateReservationRequest,
    Customer,
    DistributionReservationSummaryType,
    PersonName,
    Profile,
    ProfileInfo,
    Reservation,
    ReservationCollection,
    ReservationGuest,
    ReservationListResponse,
    ReservationSummary,
    ReservationSummaryResponse,
    RoomStay,
    UniqueID,
)


class ReservationService:
    """Service for reservation domain logic."""

    def __init__(self, reservation_dao: ReservationDAO = Depends()) -> None:
        self.reservation_dao = reservation_dao

    def _map_to_schema(self, model: Any) -> Reservation:
        """Helper to map DAO model or mock object to Pydantic schema."""
        return Reservation(
            reservationIdList=[
                UniqueID(id=model.reservation_id, type="Reservation"),
                UniqueID(id=model.confirmation_number, type="Confirmation"),
            ],
            roomStay=RoomStay(**model.room_stay)
            if isinstance(model.room_stay, dict)
            else model.room_stay,
            reservationGuests=[
                ReservationGuest(**g) if isinstance(g, dict) else g
                for g in model.reservation_guests
            ],
            hotelId=model.hotel_id,
            reservationStatus=model.reservation_status,
            createDateTime=model.create_date_time,
        )

    async def get_reservations(
        self,
        hotel_id: str,
        surname: str | None = None,
        given_name: str | None = None,
        arrival_start_date: date | None = None,
        arrival_end_date: date | None = None,
        confirmation_numbers: list[str] | None = None,
        limit: int = 100,
        offset: int = 0,
    ) -> ReservationListResponse:
        """Search reservations and return with fallback mock data if empty."""
        models = await self.reservation_dao.search_reservations(
            hotel_id=hotel_id,
            surname=surname,
            given_name=given_name,
            arrival_start_date=arrival_start_date,
            arrival_end_date=arrival_end_date,
            confirmation_numbers=confirmation_numbers,
            limit=limit,
            offset=offset,
        )

        if not models:
            # Fallback mock data
            mock_reservation = Reservation(
                reservationIdList=[
                    UniqueID(id="571062", type="Reservation"),
                    UniqueID(id="813595", type="Confirmation"),
                ],
                hotelId=hotel_id,
                reservationStatus="Reserved",
                roomStay=RoomStay(
                    arrivalDate=date(2026, 1, 22),
                    departureDate=date(2026, 1, 23),
                ),
                reservationGuests=[
                    ReservationGuest(
                        profileInfo=ProfileInfo(
                            profile=Profile(
                                customer=Customer(
                                    personName=[PersonName(givenName="Jennifer", surname="Clarke")]
                                )
                            )
                        ),
                        primary=True,
                    )
                ],
                createDateTime=datetime.now(),
            )
            return ReservationListResponse(
                reservations=ReservationCollection(reservation=[mock_reservation])
            )

        return ReservationListResponse(
            reservations=ReservationCollection(reservation=[self._map_to_schema(m) for m in models])
        )

    async def get_reservations_summary(
        self,
        hotel_id: str,
        arrival_date: date | None = None,
        last_name: str | None = None,
        limit: int = 200,
        offset: int = 0,
    ) -> ReservationSummaryResponse:
        """Get brief summary list of reservations."""
        models = await self.reservation_dao.search_reservations(
            hotel_id=hotel_id,
            surname=last_name,
            arrival_start_date=arrival_date,
            arrival_end_date=arrival_date,
            limit=limit,
            offset=offset,
        )

        if not models:
            # Mock summary
            return ReservationSummaryResponse(
                reservations=[
                    ReservationSummary(
                        reservationId="571062",
                        confirmationNumber="813595",
                        guestName="Jennifer Clarke",
                        arrivalDate=date(2026, 1, 22),
                        departureDate=date(2026, 1, 23),
                        status="Reserved",
                    )
                ]
            )

        summaries = [
            ReservationSummary(
                reservationId=m.reservation_id,
                confirmationNumber=m.confirmation_number,
                guestName=f"{m.guest_first_name} {m.guest_last_name}",
                arrivalDate=m.arrival_date,
                departureDate=m.departure_date,
                status=m.reservation_status,
            )
            for m in models
        ]
        return ReservationSummaryResponse(reservations=summaries)

    async def create_reservation(
        self, hotel_id: str, request: CreateReservationRequest
    ) -> ReservationListResponse:
        """Create a new reservation."""
        # Get reservation list from the ReservationCollection
        if not request.reservations or not request.reservations.reservation:
            return ReservationListResponse(reservations=ReservationCollection(reservation=[]))

        res_data = request.reservations.reservation[0]

        # Extract guest names for the top-level columns
        guest = res_data.reservationGuests[0] if res_data.reservationGuests else None
        first_name = ""
        last_name = ""
        if (
            guest
            and guest.profileInfo
            and guest.profileInfo.profile
            and guest.profileInfo.profile.customer
            and guest.profileInfo.profile.customer.personName
        ):
            person_names = guest.profileInfo.profile.customer.personName
            if person_names:
                first_name = person_names[0].givenName or ""
                last_name = person_names[0].surname or ""

        # Extract number of adults and children from room stay
        num_adults = 1
        num_children = 0
        if res_data.roomStay and res_data.roomStay.guestCounts:
            guest_counts = res_data.roomStay.guestCounts
            num_adults = guest_counts.adults if guest_counts.adults is not None else 1
            num_children = guest_counts.children if guest_counts.children is not None else 0

        conf_num = str(uuid4().int)[:8]
        res_id = str(uuid4().int)[:6]

        arrival_date = res_data.roomStay.arrivalDate if res_data.roomStay else date.today()
        departure_date = res_data.roomStay.departureDate if res_data.roomStay else date.today()

        model = await self.reservation_dao.create_reservation(
            reservation_id=res_id,
            confirmation_number=conf_num,
            hotel_id=hotel_id,
            arrival_date=arrival_date,
            departure_date=departure_date,
            guest_first_name=first_name,
            guest_last_name=last_name,
            number_of_adults=num_adults,
            number_of_children=num_children,
            room_stay=res_data.roomStay.model_dump(mode="json") if res_data.roomStay else {},
            reservation_guests=[g.model_dump(mode="json") for g in res_data.reservationGuests]
            if res_data.reservationGuests
            else [],
            reservation_status="Reserved",
        )

        return ReservationListResponse(
            reservations=ReservationCollection(reservation=[self._map_to_schema(model)])
        )

    async def update_reservation(
        self, hotel_id: str, reservation_id: str, request: CreateReservationRequest
    ) -> ReservationListResponse:
        """Update an existing reservation."""
        # Get reservation list from the ReservationCollection
        if not request.reservations or not request.reservations.reservation:
            return ReservationListResponse(reservations=ReservationCollection(reservation=[]))

        res_data = request.reservations.reservation[0]

        # Extract guest names for the top-level columns
        guest = res_data.reservationGuests[0] if res_data.reservationGuests else None
        first_name = ""
        last_name = ""
        if (
            guest
            and guest.profileInfo
            and guest.profileInfo.profile
            and guest.profileInfo.profile.customer
            and guest.profileInfo.profile.customer.personName
        ):
            person_names = guest.profileInfo.profile.customer.personName
            if person_names:
                first_name = person_names[0].givenName or ""
                last_name = person_names[0].surname or ""

        # Extract number of adults and children from room stay
        num_adults = 1
        num_children = 0
        if res_data.roomStay and res_data.roomStay.guestCounts:
            guest_counts = res_data.roomStay.guestCounts
            num_adults = guest_counts.adults if guest_counts.adults is not None else 1
            num_children = guest_counts.children if guest_counts.children is not None else 0

        arrival_date = res_data.roomStay.arrivalDate if res_data.roomStay else date.today()
        departure_date = res_data.roomStay.departureDate if res_data.roomStay else date.today()
        status = res_data.reservationStatus if res_data.reservationStatus else "Reserved"

        # Update the reservation with all fields
        updated_model = await self.reservation_dao.update_reservation(
            reservation_id=reservation_id,
            hotel_id=hotel_id,
            arrival_date=arrival_date,
            departure_date=departure_date,
            guest_first_name=first_name,
            guest_last_name=last_name,
            number_of_adults=num_adults,
            number_of_children=num_children,
            room_stay=res_data.roomStay.model_dump(mode="json") if res_data.roomStay else {},
            reservation_guests=[g.model_dump(mode="json") for g in res_data.reservationGuests]
            if res_data.reservationGuests
            else [],
            reservation_status=status,
        )

        if not updated_model:
            # If not found in DB, return empty response
            return ReservationListResponse(reservations=ReservationCollection(reservation=[]))

        return ReservationListResponse(
            reservations=ReservationCollection(reservation=[self._map_to_schema(updated_model)])
        )

    async def cancel_reservation(
        self, hotel_id: str, reservation_id: str, request: CancelReservationRequest
    ) -> CancelReservationDetails:
        """Cancel a reservation."""
        cxl_num = str(uuid4().int)[:10]

        updated_model = await self.reservation_dao.update_reservation(
            reservation_id=reservation_id,
            reservation_status="Cancelled",
            cancellation_number=cxl_num,
            cancellation_reason_code=request.reason.code if request.reason else None,
            cancellation_reason_desc=request.reason.description if request.reason else None,
        )

        if not updated_model:
            return CancelReservationDetails(
                reservationIdList=[UniqueID(id=reservation_id, type="Reservation")],
                cancellationNumber=UniqueID(id=f"CXL-{cxl_num}", type="Cancellation"),
                status="Cancelled",
            )

        return CancelReservationDetails(
            reservationIdList=[UniqueID(id=updated_model.reservation_id, type="Reservation")],
            cancellationNumber=UniqueID(id=updated_model.cancellation_number, type="Cancellation"),
            status="Cancelled",
        )

    async def get_distribution_statistics(
        self,
        hotel_id: str,
        start_date: date | None = None,
        end_date: date | None = None,
        limit: int = 20,
        offset: int = 0,
    ) -> CheckDistributionReservationsSummary:
        """Get reservation distribution statistics."""
        models = await self.reservation_dao.get_distribution_statistics(
            hotel_id=hotel_id,
            start_date=start_date,
            end_date=end_date,
            limit=limit,
            offset=offset,
        )

        items = []
        for m in models:
            item = DistributionReservationSummaryType(
                hotelId=m.hotel_id,
                channelCode="WEB",
                arrivalDate=m.arrival_date,
                departureDate=m.departure_date,
                creationDate=m.create_date_time,
                lastUpdateDate=m.update_date_time,
                numberOfRooms=1,
                reservationStatus=m.reservation_status,
                confirmationId=m.confirmation_number,
                legNumber="1",
                reservationId=m.reservation_id,
                guestName=f"{m.guest_first_name} {m.guest_last_name}".strip(),
                creatorId="System",
            )
            items.append(item)

        return CheckDistributionReservationsSummary(
            checkReservations=items, hasMore=len(items) >= limit
        )
