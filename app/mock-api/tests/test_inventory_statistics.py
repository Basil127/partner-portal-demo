from fastapi import FastAPI
from httpx import AsyncClient
from starlette import status


async def test_get_inventory_statistics_valid(fastapi_app: FastAPI, client: AsyncClient) -> None:
    """Test valid request for inventory statistics."""
    url = "/api/inv/v1/hotels/HOTEL1/inventoryStatistics"
    params = {
        "dateRangeStart": "2026-01-23",
        "dateRangeEnd": "2026-01-25",
        "reportCode": "DetailedAvailabiltySummary",
    }

    response = await client.get(url, params=params)
    assert response.status_code == status.HTTP_200_OK, f"Response: {response.text}"
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert data[0]["hotelName"] == "Hotel HOTEL1"
    # Check if dates are populated
    stats = data[0]["statistics"]
    assert len(stats) > 0
    dates = stats[0]["statisticDate"]
    assert len(dates) == 3  # 23, 24, 25 included? Yes, days=delta+1


async def test_get_inventory_statistics_invalid_params(client: AsyncClient) -> None:
    """Test request with missing required parameters."""
    url = "/api/inv/v1/hotels/HOTEL1/inventoryStatistics"
    # Missing dateRangeStart, dateRangeEnd, reportCode
    response = await client.get(url)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


async def test_get_inventory_statistics_invalid_date_format(
    client: AsyncClient,
) -> None:
    """Test request with invalid date format."""
    url = "/api/inv/v1/hotels/HOTEL1/inventoryStatistics"
    params = {
        "dateRangeStart": "invalid-date",
        "dateRangeEnd": "2026-01-25",
        "reportCode": "DetailedAvailabiltySummary",
    }
    response = await client.get(url, params=params)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
