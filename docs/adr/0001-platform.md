# ADR 0001: Establish a verifiable platform before domain features

Status: accepted for implementation; Compose verification pending.

Use FastAPI, SQLAlchemy/Alembic, PostgreSQL/pgvector, Celery/Redis, MinIO and
React/Vite/TypeScript, following the supplied specification. uv and npm lockfiles record
the resolver's selected dependency versions. Python supports 3.12 and 3.13 initially.
Model dimensions and providers are deferred until their actual integration phase.

The supplied specification requires phase exit checks before continuing. The initial
machine lacks Docker and Make. Provide a PowerShell command wrapper so Make is optional;
Docker remains required for real integration acceptance. Do not substitute mock services.

Readiness is guarded with a separate token and never routed through the web proxy.
It checks the expected migration, vector extension, Redis and the private bucket's existence.
It returns redacted failure states. Liveness is public and dependency-free.

Phase 0 cannot satisfy application production security, so staging and production startup
are explicitly disabled. That guard must only be replaced once real identity, permissions,
secret validation and deployment acceptance checks exist.

Registry verification found MinIO's Docker Hub repositories unavailable (404). The local
storage Dockerfile therefore builds the official latest release reported by GitHub,
RELEASE.2025-10-15T17-29-55Z, pinned to commit
`9e49d5e7a648f00e26f2246f4dc28e6b07f8c84a`. Bootstrap uses the existing boto3 dependency,
avoiding an additional unavailable mc image. The Go builder and other Docker Hub images
are pinned to registry-verified manifest digests. The source container build still requires
Docker verification. This local storage choice is not a production support/security endorsement.
MinIO is AGPL-3.0; its license is retained in the image. Cloud storage remains planned as S3.

References checked during implementation:
- https://docs.astral.sh/uv/guides/integration/docker/
- https://fastapi.tiangolo.com/deployment/docker/
- https://docs.celeryq.dev/en/stable/getting-started/first-steps-with-celery.html
