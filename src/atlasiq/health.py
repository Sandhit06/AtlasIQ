from concurrent.futures import ThreadPoolExecutor
from typing import Protocol

import boto3
from botocore.config import Config
from redis import Redis
from sqlalchemy import text

from atlasiq.config import Settings
from atlasiq.db.session import create_db_engine


class Probe(Protocol):
    def __call__(self, settings: Settings) -> None: ...


def database_probe(settings: Settings) -> None:
    engine = create_db_engine(settings)
    try:
        with engine.connect() as connection:
            version = connection.scalar(text("SELECT version_num FROM alembic_version"))
            if version != "0001_platform":
                raise RuntimeError("Database migration is not current")
            if not connection.scalar(
                text("SELECT EXISTS(SELECT 1 FROM pg_extension WHERE extname='vector')")
            ):
                raise RuntimeError("Vector extension is missing")
    finally:
        engine.dispose()


def redis_probe(settings: Settings) -> None:
    with Redis.from_url(
        settings.redis_url.get_secret_value(), socket_connect_timeout=3, socket_timeout=3
    ) as client:
        client.ping()


def storage_probe(settings: Settings) -> None:
    client = boto3.client(
        "s3",
        endpoint_url=settings.s3_endpoint_url,
        aws_access_key_id=settings.s3_access_key_id.get_secret_value(),
        aws_secret_access_key=settings.s3_secret_access_key.get_secret_value(),
        region_name=settings.aws_region,
        config=Config(connect_timeout=3, read_timeout=3, retries={"total_max_attempts": 1}),
    )
    try:
        client.head_bucket(Bucket=settings.s3_bucket)
    finally:
        client.close()


PROBES: dict[str, Probe] = {
    "database": database_probe,
    "redis": redis_probe,
    "storage": storage_probe,
}


def check_dependencies(settings: Settings) -> dict[str, str]:
    def run(item: tuple[str, Probe]) -> tuple[str, str]:
        name, probe = item
        try:
            probe(settings)
            return name, "ready"
        except Exception:
            # Dependency exceptions often contain connection strings or credentials.
            return name, "unavailable"

    with ThreadPoolExecutor(max_workers=len(PROBES)) as executor:
        return dict(executor.map(run, PROBES.items()))
