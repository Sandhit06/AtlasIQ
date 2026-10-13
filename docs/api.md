# Implemented API

The generated contract is [openapi.json](openapi.json). Run the `openapi` development
command after contract changes. CI exports it again and rejects uncommitted drift.

| Endpoint | Access | Result |
| --- | --- | --- |
| GET /health/live | Public | 200, process is alive |
| GET /health/ready | X-Health-Token | 200 ready, 503 dependency unavailable, 401 unauthorized |

The health endpoints are outside `/api/v1`, matching the roadmap's liveness exit criterion.
Future domain endpoints will use `/api/v1`. No domain endpoints exist yet.
Requests receive a generated X-Request-ID response header; client-provided IDs are not trusted.
Expected HTTP/validation errors use `error.code`, `error.message` and `error.request_id`.
