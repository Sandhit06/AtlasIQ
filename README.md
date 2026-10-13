# AtlasIQ

Enterprise knowledge intelligence with tenant isolation, permission-aware retrieval and traceable citations.

**Current status: Phase 0 implemented; local unit/build checks pass, Docker verification blocked. Not production-ready.**
The full requirements are preserved in [AtlasIQ_README.md](AtlasIQ_README.md).
See [IMPLEMENTATION_LOG.md](IMPLEMENTATION_LOG.md) for actual verification and blockers.

## What exists

- FastAPI process liveness and guarded PostgreSQL/pgvector, Redis and S3 readiness.
- Celery worker bootstrap with JSON-only serialization and bounded task execution.
- Alembic platform migration; PostgreSQL is required, with no SQLite fallback.
- Compose services for API, worker, PostgreSQL, Redis, MinIO and web, plus migrations and tests.
- React/TypeScript platform page with a real API liveness check and explicit roadmap labels.
- Locked Python/npm dependencies, linting, type checks, unit tests and real-service integration tests.
- CI configuration for code checks, frontend build, OpenAPI drift and the Compose stack.

Identity, document ingestion, retrieval, citations, conversations and evaluation are **not implemented yet**.
Runtime configuration refuses staging/production until the security phases are complete.

## Local stack

Install Docker Desktop with Linux containers and Compose v2. Then:

```powershell
Copy-Item .env.example .env
.\scripts\dev.ps1 up
.\scripts\dev.ps1 migrate
.\scripts\dev.ps1 test
```

On Linux/macOS with Make:

```sh
cp .env.example .env
make up
make migrate
make test
```

Web: http://localhost:8080. API documentation: http://localhost:8000/docs.
Public liveness: http://localhost:8000/health/live.
`/health/ready` requires the `X-Health-Token` header from your local environment.
The web proxy does not expose readiness. Only API/web ports bind to loopback;
PostgreSQL, Redis and MinIO stay inside the Compose network.

Compose runs the Alembic migration and private-bucket initialization before starting
the API/worker. Database, Redis and object data use named volumes. `down` preserves
these volumes. Never use `down --volumes` on data you want to keep.

MinIO builds from a pinned official source commit because the upstream Docker Hub
repositories were unavailable during setup. Its first build is substantially heavier than
pulling an image. See the architecture decision for provenance and the verification gap.

**Docker commands have not been verified on the initial Windows host because Docker is absent.**
Do not interpret a unit-test pass as a database or full-stack pass.

## Development without containers

Install Python 3.12 or 3.13, uv 0.13.0 and Node 24.

```sh
uv sync --locked
uv run --locked ruff check .
uv run --locked ruff format --check .
uv run --locked mypy src apps/api apps/worker
uv run --locked pytest -m "not integration" -q
uv run --locked uvicorn apps.api.main:app --host 127.0.0.1 --port 8000 --no-access-log
```

In another terminal:

```sh
cd apps/web
npm ci
npm run dev
```

The web dev server proxies liveness to localhost:8000. Without infrastructure,
liveness succeeds but readiness correctly fails. The Compose `.env` uses container
DNS names; a host-native API needs host-accessible service URLs instead.

Windows can run `.\scripts\dev.ps1 check` without Make. For a repo-local uv installation:
`python -m venv .venv`, then `.\.venv\Scripts\python.exe -m pip install uv==0.13.0`.

## Phase gates

0. Verify clean Compose boot, migration, health, tests and frontend build.
1. Implement OIDC identity, memberships, document ACLs and audit events.
2. Implement safe uploads, parsers, source metadata, recoverable jobs and version promotion.
3. Implement authorized FTS/vector retrieval, fusion, provider adapters and citation validation.
4. Implement bounded LangGraph comparison and permission-aware conversation state.
5. Curate evaluation data, produce measured reports and instrument the system.
6. Complete UI, cloud infrastructure, security checks, staging and recovery evidence.

Each phase must pass its tests and real Compose acceptance checks before the next phase.
The future `seed-demo` and `eval-demo` commands will be added with their implementations;
they are intentionally not represented as successful no-op commands now.

See [architecture](docs/architecture.md), [operations](docs/operations.md),
[API](docs/api.md), [threat model](docs/threat-model.md) and [decisions](docs/adr/0001-platform.md).

## ⚠ Disclaimer
This tool is developed for educational and developmental purposes. It's crucial to understand the implications and responsibilities of using such technologies in real-world applications.


## Still need help?
Open an issue on our GitHub repository, and we will help you as soon as possible.

Enjoy exploring and extending this project! Feel free to contribute and suggest improvements.

## Contact

If you want to contact me you can reach me at [Twitter](https://x.com/SandhitK).

## Developer
<table>
    <tr align="center">
        <td>
        Sandhit Karmakar
        <p align="center">
            <img src = "https://avatars.githubusercontent.com/u/90787826?v=4" width="150" height="150" alt="Dhruv Shah">
        </p>
            <p align="center">
                <a href="https://github.com/Sandhit06">
                    <img src="https://api.iconify.design/mdi:github.svg?color=%230088cc" width="36" height="36" alt="GitHub"/>
                </a>
                <a href="https://www.linkedin.com/in/sandhit-karmakar/" target="_blank">
                    <img src="https://api.iconify.design/mdi:linkedin.svg?color=%230088cc" width="36" height="36" alt="LinkedIn"/>
                </a>
                <a href="mailto:sandhitkarmakar@gmail.com" target="_blank">
                    <img src="https://api.iconify.design/mdi:email.svg?color=%230088cc" width="36" height="36" alt="Email"/>
                </a>
            </p>
        </td>
    </tr>
</table>

<p align="center">
    Made with ❤️ by <a href="https://github.com/Sandhit06">Sandhit Karmakar</a>
</p>
