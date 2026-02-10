from typing import Any

from fastapi import Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from operaclone2.db.dependencies import get_db_session
from operaclone2.db.models.hotel import Hotel
from operaclone2.db.models.room_type import RoomType


class HotelDAO:
    """Class for accessing hotel table."""

    def __init__(self, session: AsyncSession = Depends(get_db_session)) -> None:
        self.session = session

    async def create_hotel(self, **kargs: Any) -> None:
        """
        Add single hotel to session.

        :param kargs: fields of a hotel.
        """
        self.session.add(Hotel(**kargs))

    async def get_hotel_by_code(self, hotel_code: str) -> Hotel | None:
        """
        Get hotel by its code.

        :param hotel_code: code of a hotel.
        :return: hotel instance or None.
        """
        raw_hotel = await self.session.execute(
            select(Hotel).where(Hotel.hotel_code == hotel_code),
        )
        return raw_hotel.scalars().first()

    async def get_hotels_by_codes(self, hotel_codes: list[str]) -> list[Hotel]:
        """
        Get hotels by their codes.

        :param hotel_codes: list of hotel codes.
        :return: list of hotels.
        """
        raw_hotels = await self.session.execute(
            select(Hotel).where(Hotel.hotel_code.in_(hotel_codes)),
        )
        return list(raw_hotels.scalars().fetchall())

    async def get_all_hotels(self, limit: int, offset: int) -> list[Hotel]:
        """
        Get all hotels with limit/offset pagination.

        :param limit: limit of hotels.
        :param offset: offset of hotels.
        :return: list of hotels.
        """
        raw_hotels = await self.session.execute(
            select(Hotel).limit(limit).offset(offset),
        )

        return list(raw_hotels.scalars().fetchall())

    async def total_properties_count(self) -> int:
        """
        Get total count of properties.

        :returns: Total number of properties.
        """
        total_count = await self.session.scalar(select(func.count()).select_from(Hotel))
        return total_count or 0

    async def get_room_types_by_hotel(
        self,
        hotel_code: str,
        limit: int,
        offset: int,
        room_type_filter: str | None = None,
        include_amenities: bool = False,
    ) -> tuple[list[RoomType], int]:
        """
        Get room types with pagination and filters.

        :param hotel_code: Hotel code filter.
        :param limit: Page limit.
        :param offset: Page offset.
        :param room_type_filter: Room type string filter.
        :return: List of room types and total count.
        """
        query = select(RoomType).join(Hotel).where(Hotel.hotel_code == hotel_code)

        if room_type_filter:
            query = query.where(RoomType.room_type == room_type_filter)

        # Count query
        count_query = select(func.count()).select_from(query.subquery())
        total_count = await self.session.scalar(count_query)

        # Paginated results
        query = query.limit(limit).offset(offset)

        # If we weren't storing amenities in JSON, we'd join here.
        # Since it's JSON, we just fetch normally.

        result = await self.session.execute(query)
        return list(result.scalars().fetchall()), total_count or 0
