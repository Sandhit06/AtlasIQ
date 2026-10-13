"""Real dependencies only. Run inside the Compose test service."""

import os
import subprocess
import time

import httpx
import pytest
from sqlalchemy import text

from apps.worker.main import celery_app
from atlasiq.config import get_settings
from atlasiq.db.session import create_db_engine
from atlasiq.health import check_dependencies

pytestmark = [
    pytest.mark.integration,
    pytest.mark.skipif(os.getenv("RUN_INTEGRATION") != "1", reason="Requires real Compose stack"),
]


def test_migrations_and_dependency_connections() -> None:
    subprocess.run(["alembic", "upgrade", "head"], check=True, timeout=30)
    subprocess.run(["alembic", "check"], check=True, timeout=30)
    assert check_dependencies(get_settings()) == {
        "database": "ready",
        "redis": "ready",
        "storage": "ready",
    }
    engine = create_db_engine(get_settings())
    try:
        with engine.connect() as conn:
            distance = conn.scalar(text("SELECT '[1,0,0]'::vector <=> '[1,0,0]'::vector"))
            assert distance == pytest.approx(0)
    finally:
        engine.dispose()


def test_running_api() -> None:
    response = httpx.get("http://api:8000/health/live", timeout=10)
    assert response.status_code == 200
    assert response.json() == {"status": "alive"}
    assert httpx.get("http://api:8000/health/ready", timeout=10).status_code == 401


def test_worker_connected_to_real_broker() -> None:
    for _ in range(10):
        replies = celery_app.control.ping(timeout=2)
        if replies:
            assert any(item.get("ok") == "pong" for reply in replies for item in reply.values())
            return
        time.sleep(1)
    pytest.fail("No Celery worker answered via Redis")
