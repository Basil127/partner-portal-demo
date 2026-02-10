from datetime import date, timedelta

from operaclone2.web.api.inventory.schema import (
    InventoryStatistics,
    NumericCategorySummaryType,
    StatisticCodeType,
    StatisticSetType,
    StatisticType,
)


class InventoryService:
    """Service for inventory domain logic."""

    def get_inventory_statistics(
        self,
        hotel_id: str,
        date_range_start: date,
        date_range_end: date,
        report_code: str,
    ) -> InventoryStatistics:
        """
        Get inventory statistics for a hotel.

        Generates mock data based on the requested date range.
        """
        # Calculate date range
        delta = date_range_end - date_range_start
        days = delta.days + 1

        # Limit strictly to 62 days if needed, but we'll valid requests passed in.

        statistic_sets: list[StatisticSetType] = []

        for i in range(days):
            current_date = date_range_start + timedelta(days=i)
            is_weekend = current_date.weekday() >= 5  # 5=Sat, 6=Sun

            statistic_sets.append(
                StatisticSetType(
                    statisticDate=current_date,
                    weekendDate=is_weekend,
                    revenue=None,
                    inventory=[
                        NumericCategorySummaryType(code="SequenceId", value=1),
                        NumericCategorySummaryType(
                            code="Available", value=100 if not is_weekend else 80
                        ),
                    ],
                )
            )

        # Mock Statistic Codes
        stat_codes = [
            StatisticCodeType(
                statCode=hotel_id,
                statCategoryCode="HotelCode",
                statisticDate=statistic_sets,
                statCodeClass=None,
                description=None,
            ),
            StatisticCodeType(
                statCode="STD",
                statCategoryCode="HotelRoomCode",
                statCodeClass="ALL",
                description="Standard Room",
                statisticDate=statistic_sets,  # Reusing same sets for simplicity
            ),
        ]

        return [
            StatisticType(
                statistics=stat_codes,
                hotelName=f"Hotel {hotel_id}",
                reportCode=report_code,
                description="Mock Inventory Statistics",
            )
        ]
