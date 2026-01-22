from fastapi import Depends

from operaclone2.db.dao.hotel_dao import HotelDAO
from operaclone2.db.models.hotel import Hotel
from operaclone2.db.models.room_type import RoomType
from operaclone2.errors.exceptions import HotelNotFoundError
from operaclone2.web.api.content.schema import (
    Address,
    ContentPropertyInfo,
    ContentRoomAmenity,
    ContentRoomType,
    Occupancy,
    OfferPointOfInterest,
    PropertyInfoResponse,
    PropertyOffersHotelAmenity,
    PropertySnippet,
)


class ContentService:
    """Service for property content domain logic."""

    def __init__(self, hotel_dao: HotelDAO = Depends()) -> None:
        self.hotel_dao = hotel_dao

    async def get_all_properties_summary(
        self,
        limit: int = 20,
        offset: int = 0,
    ) -> list[PropertySnippet]:
        """
        Get all properties formatted as snippets.

        :param limit: Page size.
        :param offset: Page offset.
        :returns: List of property snippets.
        """
        hotels = await self.hotel_dao.get_all_hotels(limit=limit, offset=offset)
        return [self.map_hotel_to_summary(h) for h in hotels]

    async def get_property_details(self, hotel_code: str) -> Hotel:
        """
        Get a single property's full details.

        :param hotel_code: Unique hotel identifier.
        :returns: Property details.
        :raises HotelNotFoundError: If hotel is not found.
        """
        hotel = await self.hotel_dao.get_hotel_by_code(hotel_code)
        if not hotel:
            raise HotelNotFoundError(f"Hotel {hotel_code} not found")
        return hotel

    async def get_room_types(
        self,
        hotel_code: str,
        limit: int = 20,
        offset: int = 0,
        room_type_filter: str | None = None,
        include_room_amenities: bool = False,
    ) -> tuple[list[ContentRoomType], int]:
        """
        Get room types for a property.

        :param hotel_code: Hotel code.
        :param limit: Page limit.
        :param offset: Page offset.
        :param room_type_filter: Optional room type filter.
        :param include_room_amenities: Whether to include room amenities.
        :returns: Tuple of (list of room types, total count).
        :raises HotelNotFoundError: If hotel is not found.
        """
        # Ensure hotel exists
        hotel = await self.hotel_dao.get_hotel_by_code(hotel_code)
        if not hotel:
            raise HotelNotFoundError(f"Hotel {hotel_code} not found")

        raw_room_types, total_count = await self.hotel_dao.get_room_types_by_hotel(
            hotel_code=hotel_code,
            limit=limit,
            offset=offset,
            room_type_filter=room_type_filter,
            include_amenities=include_room_amenities,
        )

        return [
            self._map_room_type(rt, include_amenities=include_room_amenities)
            for rt in raw_room_types
        ], total_count

    async def total_properties_count(self) -> int:
        """
        Get total count of properties.

        :returns: Total number of properties.
        """
        # This is a placeholder implementation.
        # In a real scenario, you would implement a count query in the DAO.
        return await self.hotel_dao.total_properties_count()

    def map_hotel_to_summary(self, hotel: Hotel) -> PropertySnippet:
        """Map Hotel model to PropertySnippet for summary list."""
        return PropertySnippet(
            hotelId=hotel.hotel_id,
            hotelCode=hotel.hotel_code,
            hotelName=hotel.hotel_name,
            hotelDescription=hotel.hotel_description,
            address=self._map_address(hotel),
            coordinates={
                "latitude": hotel.latitude or 0.0,
                "longitude": hotel.longitude or 0.0,
            },
            connectivity={
                "connectionStatus": "Connected",  # Placeholder
            },
            meta=hotel.meta or {},
        )

    def map_hotel_to_detail(self, hotel: Hotel) -> PropertyInfoResponse:
        """Map Hotel model to full PropertyInfoResponse."""
        info = ContentPropertyInfo(
            hotelId=hotel.hotel_id,
            enterpriseId=hotel.enterprise_id,
            hotelCode=hotel.hotel_code,
            hotelName=hotel.hotel_name,
            hotelDescription=hotel.hotel_description,
            chainCode=hotel.chain_code,
            clusterCode=hotel.cluster_code,
            address=self._map_address(hotel),
            latitude=hotel.latitude,
            longitude=hotel.longitude,
            propertyAmenities=[
                PropertyOffersHotelAmenity(
                    code=a.get("hotelAmenity") or a.get("code"),
                    description=a.get("description"),
                )
                for a in (hotel.property_amenities or [])
            ],
            pointOfInterest=[
                OfferPointOfInterest(
                    name=p.get("name"),
                    distance=p.get("distance"),
                    unit=p.get("unit"),
                )
                for p in (hotel.point_of_interest or [])
            ],
            currencyCode=hotel.currency_code,
            primaryLanguage=hotel.primary_language,
            totalNumberOfRooms=hotel.total_number_of_rooms,
            petPolicy=hotel.pet_policy,
        )
        return PropertyInfoResponse(propertyInfo=info)

    def _map_address(self, hotel: Hotel) -> Address:
        return Address(
            lines=hotel.address_lines or [],
            city=hotel.city_name,
            countryCode=hotel.country_code,
            postalCode=hotel.postal_code,
            state=hotel.state_prov,
        )

    def _map_room_type(
        self,
        room_type: RoomType,
        include_amenities: bool = False,
    ) -> ContentRoomType:
        amenities = None
        if include_amenities:
            amenities_data = room_type.room_amenities or []
            amenities = [
                ContentRoomAmenity(
                    roomAmenity=a.get("roomAmenity", ""),
                    description=a.get("description", ""),
                    quantity=a.get("quantity", 0),
                    includeInRate=a.get("includeInRate", False),
                    confirmable=a.get("confirmable", False),
                )
                for a in amenities_data
            ]

        occupancy_data = room_type.occupancy or {}

        return ContentRoomType(
            hotelRoomType=room_type.hotel_room_type,
            roomType=room_type.room_type,
            description=room_type.description or [],
            roomName=room_type.room_name,
            roomCategory=room_type.room_category,
            roomAmenities=amenities or [],
            roomViewType=room_type.room_view_type,
            roomPrimaryBedType=room_type.room_primary_bed_type,
            nonSmokingInd=room_type.non_smoking_ind,
            occupancy=Occupancy(**occupancy_data) if occupancy_data else None,
            numberOfUnits=room_type.number_of_units,
        )
