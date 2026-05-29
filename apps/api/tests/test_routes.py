"""Basic smoke tests for the FastAPI routes."""
import pytest
from httpx import AsyncClient, ASGITransport
from unittest.mock import AsyncMock, patch

from missionguard_api.main import app


@pytest.mark.asyncio
async def test_health():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


@pytest.mark.asyncio
async def test_gift_intake_requires_auth():
    """Unauthenticated request should return 401."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post(
            "/api/v1/gifts",
            json={
                "organization_id": "00000000-0000-0000-0000-000000000001",
                "donor_name": "Test Foundation",
                "raw_offer_text": "Test offer",
            },
        )
    assert response.status_code == 401
