from functools import lru_cache
from typing import Literal

from pydantic import SecretStr, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_env: Literal["development", "test", "staging", "production"] = "development"
    database_url: SecretStr = SecretStr(
        "postgresql+psycopg://atlasiq:local-only-change-me@localhost:5432/atlasiq"
    )
    redis_url: SecretStr = SecretStr("redis://localhost:6379/0")
    s3_endpoint_url: str | None = "http://localhost:9000"
    s3_bucket: str = "atlasiq-documents"
    s3_access_key_id: SecretStr = SecretStr("atlasiq-local")
    s3_secret_access_key: SecretStr = SecretStr("local-only-change-me")
    aws_region: str = "us-east-1"
    health_token: SecretStr = SecretStr("local-health-only-change-me")

    @model_validator(mode="after")
    def production_guard(self) -> "Settings":
        if not self.database_url.get_secret_value().startswith("postgresql+psycopg://"):
            raise ValueError("AtlasIQ requires PostgreSQL with the psycopg driver")
        if not self.health_token.get_secret_value():
            raise ValueError("HEALTH_TOKEN must not be empty")
        if self.app_env in {"staging", "production"}:
            # Until identity and authorization are implemented, never expose this scaffold.
            raise ValueError("Deployment is disabled until the production security gates pass")
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()
