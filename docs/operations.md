# Local operations

## Startup

Copy `.env.example` to `.env`, then run `docker compose up --build -d --wait`.
PostgreSQL and Redis have dependency health checks; storage-init retries MinIO initialization
with a finite limit. Migrate must complete before the API and worker are started. Web startup
waits for the API readiness check. Worker health uses a broker round trip to its own node.

## Diagnostics

Use `docker compose ps` and `docker compose logs --tail 100 api worker migrate storage-init`.
Liveness says only that the process runs. Readiness checks the current migration and
pgvector extension, Redis connectivity and bucket access, with bounded per-call timeouts.
The readiness endpoint returns no raw exception text or connection strings.

Run `docker compose --profile test run --build --rm test` for real dependency tests.
The test service waits for API and worker health. CI starts with fresh volumes and runs
the same tests. CI output must be inspected before claiming stack verification.

## Stop and preserve data

`docker compose down` preserves named volumes. A volume deletion is destructive and is
never part of the developer helper. CI uses volume deletion only on its disposable runner.

## Migration and recovery policy

Alembic is the only schema change path. The first downgrade retains shared extensions
to avoid destroying unrelated schema dependencies. Before future domain migrations, take
a PostgreSQL backup, test the change against a restored copy, and document data rollback.
Backup/restore automation and disaster-recovery drills are Phase 6 work, not verified here.

## Deployment

Do not deploy this scaffold publicly. Production configuration is intentionally rejected.
AWS infrastructure, cost estimates, staging tests and teardown instructions will be added
with Phase 6 after the application security and data-lifecycle tests pass.
