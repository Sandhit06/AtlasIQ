from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError

from apps.api.main import app
from atlasiq.config import Settings, get_settings


@pytest.fixture(autouse=True)
def isolated_settings(monkeypatch: pytest.MonkeyPatch) -> Iterator[None]:
    monkeypatch.setenv("APP_ENV", "test")
    monkeypatch.setenv("HEALTH_TOKEN", "test-health-secret")
    get_settings.cache_clear()
    yield
    get_settings.cache_clear()


def test_liveness_does_not_require_infrastructure() -> None:
    with TestClient(app) as client:
        response = client.get("/health/live")
        assert response.status_code == 200
        assert response.json() == {"status": "alive"}
        assert response.headers["x-request-id"]


def test_readiness_denies_unauthenticated_probe(monkeypatch: pytest.MonkeyPatch) -> None:
    def must_not_probe(settings: Settings) -> dict[str, str]:
        raise AssertionError("Unauthorized request reached dependencies")

    monkeypatch.setattr("apps.api.main.check_dependencies", must_not_probe)
    with TestClient(app) as client:
        response = client.get("/health/ready")
        assert response.status_code == 401
        assert response.json()["error"]["code"] == "UNAUTHORIZED"


@pytest.mark.parametrize("state,status", [("ready", 200), ("unavailable", 503)])
def test_readiness_reports_actual_probe_state(
    monkeypatch: pytest.MonkeyPatch, state: str, status: int
) -> None:
    monkeypatch.setattr("apps.api.main.check_dependencies", lambda _: {"database": state})
    with TestClient(app) as client:
        response = client.get("/health/ready", headers={"X-Health-Token": "test-health-secret"})
        assert response.status_code == status


def test_dependency_exception_does_not_disclose_secrets(monkeypatch: pytest.MonkeyPatch) -> None:
    from atlasiq.health import check_dependencies

    def failure(settings: Settings) -> None:
        raise RuntimeError("postgresql://secret:password@private-host")

    monkeypatch.setattr("atlasiq.health.PROBES", {"database": failure})
    assert check_dependencies(Settings()) == {"database": "unavailable"}


def test_request_ids_are_server_owned() -> None:
    with TestClient(app) as client:
        response = client.get("/missing", headers={"X-Request-ID": "untrusted"})
        assert response.status_code == 404
        assert response.headers["x-request-id"] != "untrusted"
        assert response.json()["error"]["request_id"] == response.headers["x-request-id"]


@pytest.mark.parametrize("environment", ["production", "staging"])
def test_incomplete_security_cannot_be_deployed(environment: str) -> None:
    with pytest.raises(ValidationError, match="Deployment is disabled"):
        Settings(app_env=environment)  # type: ignore[arg-type]


def test_sqlite_cannot_replace_production_database() -> None:
    with pytest.raises(ValidationError, match="requires PostgreSQL"):
        Settings(database_url="sqlite:///:memory:")  # type: ignore[arg-type]
