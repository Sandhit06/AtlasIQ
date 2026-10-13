import logging
import secrets
import time
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from uuid import uuid4

from fastapi import FastAPI, Header, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException
from starlette.middleware.base import RequestResponseEndpoint
from starlette.responses import Response

from atlasiq.config import get_settings
from atlasiq.health import check_dependencies

logger = logging.getLogger("atlasiq.http")


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    get_settings()
    yield


app = FastAPI(title="AtlasIQ API", version="0.1.0", lifespan=lifespan)


@app.middleware("http")
async def request_context(request: Request, call_next: RequestResponseEndpoint) -> Response:
    request.state.request_id = str(uuid4())
    start = time.monotonic()
    response = await call_next(request)
    response.headers["X-Request-ID"] = request.state.request_id
    response.headers["X-Content-Type-Options"] = "nosniff"
    logger.info(
        "request_complete",
        extra={
            "request_id": request.state.request_id,
            "status": response.status_code,
            "duration_ms": round((time.monotonic() - start) * 1000),
        },
    )
    return response


def error(request: Request, status: int, code: str, message: str) -> JSONResponse:
    return JSONResponse(
        status_code=status,
        content={
            "error": {"code": code, "message": message, "request_id": request.state.request_id}
        },
    )


@app.exception_handler(HTTPException)
async def http_error(request: Request, exc: HTTPException) -> JSONResponse:
    return error(request, exc.status_code, "HTTP_ERROR", str(exc.detail))


@app.exception_handler(RequestValidationError)
async def validation_error(request: Request, exc: RequestValidationError) -> JSONResponse:
    return error(request, 422, "VALIDATION_ERROR", "Request validation failed")


@app.get("/health/live", tags=["health"])
def live() -> dict[str, str]:
    return {"status": "alive"}


@app.get("/health/ready", tags=["health"], responses={401: {}, 503: {}})
def ready(request: Request, x_health_token: str = Header(default="")) -> JSONResponse:
    settings = get_settings()
    if not secrets.compare_digest(x_health_token, settings.health_token.get_secret_value()):
        return error(request, 401, "UNAUTHORIZED", "Readiness credentials required")
    checks = check_dependencies(settings)
    healthy = all(value == "ready" for value in checks.values())
    return JSONResponse(
        status_code=200 if healthy else 503,
        content={"status": "ready" if healthy else "unavailable", "dependencies": checks},
    )
