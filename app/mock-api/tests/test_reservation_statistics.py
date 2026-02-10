import pytest
from httpx import AsyncClient
from starlette import status


@pytest.mark.anyio
async def test_get_repl_statistics_happy_path(client: AsyncClient) -> None:
    """Request with valid parameters should return 200."""
    url = "/api/rsv/v1/hotels/SBOXD1/reservations/statistics"
    response = await client.get(url, params={"startDate": "2026-01-01", "endDate": "2026-01-31"})

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "checkReservations" in data
    assert "hasMore" in data


@pytest.mark.anyio
async def test_get_repl_statistics_invalid_date(client: AsyncClient) -> None:
    """Request with invalid date format should return 422."""
    url = "/api/rsv/v1/hotels/SBOXD1/reservations/statistics"
    response = await client.get(url, params={"startDate": "invalid-date"})

    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
