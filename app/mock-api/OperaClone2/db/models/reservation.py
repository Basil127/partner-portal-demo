from datetime import date, datetime
from typing import Any

from sqlalchemy import JSON, DateTime, String
from sqlalchemy.orm import Mapped, mapped_column

from operaclone2.db.base import Base


class ReservationModel(Base):
    """Reservation model."""

    __tablename__ = "reservations"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    reservation_id: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    confirmation_number: Mapped[str | None] = mapped_column(String(50), index=True)
    hotel_id: Mapped[str] = mapped_column(String(50), index=True)
    reservation_status: Mapped[str] = mapped_column(String(20), default="Reserved")

    arrival_date: Mapped[date] = mapped_column(index=True)
    departure_date: Mapped[date] = mapped_column(index=True)

    # Store guest info (usually linked to profiles, but for clone we store it here)
    guest_first_name: Mapped[str | None] = mapped_column(String(100))
    guest_last_name: Mapped[str | None] = mapped_column(String(100), index=True)

    # Store complex structures as JSON
    room_stay: Mapped[dict[str, Any]] = mapped_column(JSON)
    reservation_guests: Mapped[list[dict[str, Any]]] = mapped_column(JSON)

    create_date_time: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    update_date_time: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.now, onupdate=datetime.now
    )

    cancellation_number: Mapped[str | None] = mapped_column(String(50))
    cancellation_reason_code: Mapped[str | None] = mapped_column(String(20))
    cancellation_reason_desc: Mapped[str | None] = mapped_column(String(200))
