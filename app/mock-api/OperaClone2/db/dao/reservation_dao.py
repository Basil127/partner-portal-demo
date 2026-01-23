from datetime import date
from typing import Any

from fastapi import Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from operaclone2.db.dependencies import get_db_session
from operaclone2.db.models.reservation import ReservationModel


class ReservationDAO:
    """DAO for Reservation model."""

    def __init__(self, session: AsyncSession = Depends(get_db_session)) -> None:
        self.session = session

    async def create_reservation(self, **kwargs: Any) -> ReservationModel:
        """Create a new reservation in the database."""
        reservation = ReservationModel(**kwargs)
        self.session.add(reservation)
        await self.session.commit()
        await self.session.refresh(reservation)
        return reservation

    async def get_reservation_by_id(self, reservation_id: str) -> ReservationModel | None:
        """Get a reservation by its OPERA reservation ID."""
        query = select(ReservationModel).where(ReservationModel.reservation_id == reservation_id)
        result = await self.session.execute(query)
        return result.scalars().first()

    async def update_reservation(
        self, reservation_id: str, **kwargs: Any
    ) -> ReservationModel | None:
        """Update an existing reservation."""
        reservation = await self.get_reservation_by_id(reservation_id)
        if not reservation:
            return None

        for key, value in kwargs.items():
            setattr(reservation, key, value)

        await self.session.commit()
        await self.session.refresh(reservation)
        return reservation

    async def search_reservations(
        self,
        hotel_id: str | None = None,
        surname: str | None = None,
        given_name: str | None = None,
        arrival_start_date: date | None = None,
        arrival_end_date: date | None = None,
        confirmation_numbers: list[str] | None = None,
        limit: int = 100,
        offset: int = 0,
    ) -> list[ReservationModel]:
        """Search for reservations based on various criteria."""
        query = select(ReservationModel)

        if hotel_id:
            query = query.where(ReservationModel.hotel_id == hotel_id)
        if surname:
            query = query.where(ReservationModel.guest_last_name.ilike(f"%{surname}%"))
        if given_name:
            query = query.where(ReservationModel.guest_first_name.ilike(f"%{given_name}%"))
        if arrival_start_date:
            query = query.where(ReservationModel.arrival_date >= arrival_start_date)
        if arrival_end_date:
            query = query.where(ReservationModel.arrival_date <= arrival_end_date)
        if confirmation_numbers:
            query = query.where(ReservationModel.confirmation_number.in_(confirmation_numbers))

        query = query.limit(limit).offset(offset)
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def get_distribution_statistics(
        self,
        hotel_id: str,
        start_date: date | None = None,
        end_date: date | None = None,
        limit: int = 20,
        offset: int = 0,
    ) -> list[ReservationModel]:
        """Get reservation statistics/list based on criteria."""
        query = select(ReservationModel).where(ReservationModel.hotel_id == hotel_id)

        if start_date:
            # Cast to datetime or rely on SQL driver
            query = query.where(ReservationModel.update_date_time >= start_date)  # type: ignore
        if end_date:
            query = query.where(ReservationModel.update_date_time <= end_date)  # type: ignore

        query = query.limit(limit).offset(offset)
        result = await self.session.execute(query)
        return list(result.scalars().all())
