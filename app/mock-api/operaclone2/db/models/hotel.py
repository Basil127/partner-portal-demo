from typing import Any

from sqlalchemy.dialects import postgresql
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql.sqltypes import JSON, Float, Integer, String, Text

from operaclone2.db.base import Base


class Hotel(Base):
    """
    Hotel model representing the 'propertyInfo' structure.

    Design Concept:
    - Identifiers and commonly queried fields (Location, Name, Codes)
      are stored as top-level columns.
    - Complex nested structures like Amenities, Points of Interest,
      and Communications are stored as JSON.
      This allows for flexibility and high performance when serializing
      to the API response, while avoiding excessive joins for data that
      is rarely queried independently.
    - Address information is partially flattened to allow searching
      by City/Country/Zip.
    """

    __tablename__ = "hotels"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)

    # --- Identifiers ---
    hotel_id: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        index=True,
        comment="Internal ID like SBOXD1",
    )
    hotel_code: Mapped[str] = mapped_column(
        String(50),
        index=True,
        comment="Channel specific code like XSBOXD1",
    )
    enterprise_id: Mapped[str | None] = mapped_column(String(50))
    chain_code: Mapped[str | None] = mapped_column(String(20))
    cluster_code: Mapped[str | None] = mapped_column(String(20))

    # --- Basic Details ---
    hotel_name: Mapped[str | None] = mapped_column(String(200))
    hotel_description: Mapped[str | None] = mapped_column(Text)

    # --- Address (Flattened for Indexing) ---
    city_name: Mapped[str | None] = mapped_column(String(100), index=True)
    country_code: Mapped[str | None] = mapped_column(String(10))
    state_prov: Mapped[str | None] = mapped_column(String(50))
    postal_code: Mapped[str | None] = mapped_column(String(20))
    address_lines: Mapped[list[str] | None] = mapped_column(JSON, comment="List of address lines")

    # --- Geolocation ---
    latitude: Mapped[float | None] = mapped_column(Float)
    longitude: Mapped[float | None] = mapped_column(Float)

    # --- Operational Info ---
    currency_code: Mapped[str | None] = mapped_column(String(3))
    primary_language: Mapped[str | None] = mapped_column(String(10))
    total_number_of_rooms: Mapped[int | None] = mapped_column(Integer)
    pet_policy: Mapped[str | None] = mapped_column(String(255))

    # --- Time & Schedule ---
    time_zone_name: Mapped[str | None] = mapped_column(String(100), comment="e.g. US/Eastern")
    time_zone_offset: Mapped[str | None] = mapped_column(String(20), comment="e.g. UTC-04:00")
    check_in_time: Mapped[str | None] = mapped_column(String(10), comment="e.g. 15:00")
    check_out_time: Mapped[str | None] = mapped_column(String(10), comment="e.g. 11:00")

    # --- Rich Data (JSON stored) ---
    # Storing these as JSON allows for schema flexibility and efficient 'grab-bag' retrieval
    # matching the API structure directly.

    property_amenities: Mapped[list[dict[str, Any]] | None] = mapped_column(postgresql.JSONB)
    # Example: [{"hotelAmenity": "104", "description": "Wedding services", ...}]

    point_of_interest: Mapped[list[dict[str, Any]] | None] = mapped_column(postgresql.JSONB)
    # Example: [{"name": "Statue of Liberty", "pointOfInterestType": "ATTRACTIONS", ...}]

    communications: Mapped[dict[str, list[dict[str, Any]]] | None] = mapped_column(postgresql.JSONB)

    transportations: Mapped[list[dict[str, Any]] | None] = mapped_column(postgresql.JSONB)
    # Example: [{"transportationCode": "Metro", ...}]

    hotel_child_policy: Mapped[dict[str, Any] | None] = mapped_column(postgresql.JSONB)

    # --- Text Blocks ---
    # These are deeply nested in JSON but are essentially just large text fields.
    direction_info: Mapped[str | None] = mapped_column(
        Text,
        comment="Maps to direction.propertyDirection",
    )
    location_info: Mapped[str | None] = mapped_column(
        Text,
        comment="Maps to location.propertyLocation",
    )

    # --- Flexible Metadata ---
    meta: Mapped[dict[str, Any] | None] = mapped_column(
        postgresql.JSONB,
        default={},
        comment="Extra metadata not covered by standard schema",
    )

    def __repr__(self) -> str:
        return f"<Hotel(id={self.id}, code='{self.hotel_code}', name='{self.hotel_name}')>"
