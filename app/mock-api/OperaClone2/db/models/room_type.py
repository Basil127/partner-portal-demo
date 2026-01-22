from typing import Any

from sqlalchemy import Boolean, ForeignKey, Integer, String
from sqlalchemy.dialects import postgresql
from sqlalchemy.orm import Mapped, mapped_column, relationship

from operaclone2.db.base import Base
from operaclone2.db.models.hotel import Hotel


class RoomType(Base):
    """Room Type model."""

    __tablename__ = "room_types"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)

    # Foreign Key to Hotel
    # Using hotel_id from the Hotel table (which is an Integer PK)
    hotel_id_fk: Mapped[int] = mapped_column(ForeignKey("hotels.id"), index=True)

    # Note: The mapping often queries by hotel_code (string) which is in Hotel table.
    hotel: Mapped["Hotel"] = relationship("Hotel", backref="room_types_rel")

    # --- Identifiers ---
    hotel_room_type: Mapped[str | None] = mapped_column(String(50))
    room_type: Mapped[str | None] = mapped_column(String(50), index=True)

    # --- Details ---
    # Spec says description is array of strings
    description: Mapped[list[str] | None] = mapped_column(postgresql.JSONB)
    room_name: Mapped[str | None] = mapped_column(String(200))
    room_category: Mapped[str | None] = mapped_column(String(50))

    # --- Amenities ---
    # Storing amenities as JSON is usually sufficient if we don't need complex filtering on them
    # "roomAmenities": [{"roomAmenity": "...", "description": "...", "quantity": 1, ...}]
    room_amenities: Mapped[list[dict[str, Any]] | None] = mapped_column(postgresql.JSONB)

    # --- Attributes ---
    room_view_type: Mapped[str | None] = mapped_column(String(50))
    room_primary_bed_type: Mapped[str | None] = mapped_column(String(50))
    non_smoking_ind: Mapped[bool | None] = mapped_column(Boolean)

    # --- Occupancy ---
    # Storing as JSON: {"minOccupancy": 2, "maxOccupancy": 8, ...}
    occupancy: Mapped[dict[str, Any] | None] = mapped_column(postgresql.JSONB)

    # --- Other ---
    number_of_units: Mapped[int | None] = mapped_column(Integer)

    def __repr__(self) -> str:
        return f"<RoomType(id={self.id}, code='{self.room_type}', name='{self.room_name}')>"
