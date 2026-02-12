from datetime import date

from fastapi import APIRouter, Depends, Path, Query

from operaclone2.services.inventory_service import InventoryService
from operaclone2.web.api.inventory.schema import InventoryStatistics

router = APIRouter()


@router.get("/hotels/{hotelId}/inventoryStatistics", response_model=InventoryStatistics)
async def get_inventory_statistics(
    hotel_id: str = Path(
        ...,
        alias="hotelId",
        min_length=1,
        max_length=2000,
        description="Unique ID of the hotel where inventory statistics are searched.",
    ),
    date_range_start: date = Query(
        ...,
        alias="dateRangeStart",
        description="The starting value of the date range.",
    ),
    date_range_end: date = Query(
        ...,
        alias="dateRangeEnd",
        description="The ending value of the date range.",
    ),
    report_code: str = Query(
        ...,
        alias="reportCode",
        description=(
            "Identifies the type of statistics collected. Each ReportCode corresponds "
            "to a set of category summaries based upon a predetermined agreement."
        ),
        enum=[
            "DetailedAvailabiltySummary",
            "RoomCalendarStatistics",
            "SellLimitSummary",
            "RoomsAvailabilitySummary",
        ],
    ),
    parameter_name: list[str] | None = Query(
        None, alias="parameterName", description="Name of the parameter."
    ),
    parameter_value: list[str] | None = Query(
        None, alias="parameterValue", description="Value of the parameter."
    ),
    inventory_service: InventoryService = Depends(),
) -> InventoryStatistics:
    """
    Get a hotels Inventory Statistics.

    This will fetch a hotel's inventory statistics for a specified date range
    that you provided in the request.
    """
    return inventory_service.get_inventory_statistics(
        hotel_id=hotel_id,
        date_range_start=date_range_start,
        date_range_end=date_range_end,
        report_code=report_code,
    )
