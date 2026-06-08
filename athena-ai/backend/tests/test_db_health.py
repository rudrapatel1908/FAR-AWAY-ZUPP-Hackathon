from fastapi.testclient import TestClient

from app.main import create_app


def test_health_db_returns_connected_status() -> None:
    client = TestClient(create_app())

    response = client.get("/health/db")

    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "ok"
    assert payload["service"] == "athena-ai-backend"
    assert payload["database"] == "connected"
    assert isinstance(payload["latency_ms"], float)
    assert payload["latency_ms"] >= 0
