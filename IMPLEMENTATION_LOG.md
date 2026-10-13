# AtlasIQ implementation log

## 2026-10-11 — Phase 0: platform implementation

### Inspection and plan

The initial directory contained only `AtlasIQ_README.md` (51,053 bytes), with no code,
AGENTS.md or Git repository. Read the specification, including identity/ACL requirements,
version activation, citation provenance, evaluation and all phase exit criteria.
Preserved it unchanged. Implement phases 0 through 6 in the required order; do not
advance until the current phase's real-service acceptance checks pass.

Initial tools: Python 3.12.7, Node 24.19.0, npm 12.0.2 and Git available.
Docker CLI/Desktop and Make absent; WSL listing also failed. Provide a PowerShell wrapper
so Make is optional. Do not replace PostgreSQL/pgvector, Redis or S3 with fake runtime services.

### Implemented

- Packaged Python monorepo with FastAPI, Celery, SQLAlchemy/Alembic and environment settings.
- Liveness, secret-guarded parallel readiness, server-generated request IDs and error envelopes.
- PostgreSQL-only configuration and explicit rejection of staging/production while security is incomplete.
- Initial migration installs pgvector/pgcrypto; downgrade preserves shared extensions.
- Compose service definitions, dependency ordering, private bucket bootstrap, persistent volumes,
  non-root app/worker/web, loopback port bindings, health checks and a real-service test container.
- React/TypeScript scaffold with working liveness fetch, timeout/error handling and honest phase labels.
- uv.lock and package-lock.json; Ruff, mypy, pytest, frontend build and CI configuration.
- Initialized a local Git repository on `main`; no commits or remote publication made.
- Exported OpenAPI and operational, architecture, threat-model and ADR documentation.
- PowerShell and Make commands for startup, migration, tests, checks and contract generation.

Python dependency versions resolved from PyPI include FastAPI 0.143.0, SQLAlchemy 2.1.4,
Alembic 1.20.0, Celery 5.6.3, Redis client 6.4.0, pytest 9.1.1 and Ruff 0.17.0.
Frontend registry checks selected React 19.3.0, Vite 8.3.4, TypeScript 7.0.2 and
Vite React plugin 6.1.2. Exact transitive versions and hashes are in the lockfiles.

### Actual verification

| Command/check | Observed result |
| --- | --- |
| `uv sync` followed by clean `uv sync --locked --no-cache --reinstall` | 73 resolved packages; 72 installed project dependencies |
| `ruff check .` | All checks passed |
| `ruff format --check .` | 25 files already formatted |
| `mypy src apps/api apps/worker scripts/init_storage.py` | Success, no issues in 11 source files |
| `pytest -q` outside Windows sandbox | Final run: 9 passed, 3 skipped, 1 warning in 1.78s |
| `uv lock --check --offline --cache-dir .uv-cache` | Lockfile consistent, 73 packages resolved |
| `npm install` | 24 packages added; npm reported 0 vulnerabilities |
| `npm run build` | TypeScript check and Vite production build succeeded |
| `python scripts/export_openapi.py` | Generated docs/openapi.json |
| `alembic upgrade head --sql` | Emitted transaction, version table, extensions and revision insert successfully; offline only |
| Parse Compose via PyYAML | Parsed all 9 service definitions; not equivalent to Docker Compose validation |
| Live Uvicorn + HTTP GET /health/live | Returned `{"status":"alive"}` |
| Browser at http://127.0.0.1:5173 | Real React page displayed; live API status online; desktop layout visually inspected |
| Docker Hub tag/digest verification | Python, pgvector, Redis, Node, Nginx and Go images found; pinned returned digests |
| `docker compose version` | Failed: docker command not found |

Three skipped tests require the real Compose stack: migrations/dependency probes/vector
operator, running API and live worker-to-broker communication. Skips are not passes.
Starlette emits a deprecation warning about its HTTPX test transport; tests pass with
the currently locked HTTPX dependency. Revisit the transport dependency before Phase 1.

### Problems found and resolved

- Windows sandbox blocked venv bootstrap, package-registry networking and asyncio's
  loopback socket-pair creation. Re-ran the affected commands with approved escalation.
  Faulthandler showed the test hang inside Windows socketpair setup, before API execution.
- Initial Ruff invocation traversed `.uv-cache` before the new folder was a Git repository.
  Added explicit cache/venv/node_modules exclusions, reinstalled every locked dependency
  from clean downloads and removed the affected generated cache. Tests/type checks above
  were rerun on the clean environment.
- TypeScript 7 required Vite's CSS import declarations; added `vite-env.d.ts` and rebuilt.
- MinIO and mc Docker Hub repositories returned 404. Quay metadata was not anonymously
  available. Replaced these dependencies with a source-built official MinIO release and
  Python/boto3 bucket bootstrap. GitHub's latest release resolved to
  `RELEASE.2025-10-15T17-29-55Z`, commit `9e49d5e7a648f00e26f2246f4dc28e6b07f8c84a`.
  **The MinIO source container has not been built on this machine.**

### Phase status and next acceptance work

**Phase 0 remains incomplete at its verification gate.** No claim of production readiness,
successful Compose startup, database integration, retrieval quality or deployment is made.
Phases 1–6 are not implemented.

1. Install/start Docker Desktop with Linux containers and Compose v2 on this machine.
2. Copy `.env.example` to `.env`; run `.\scripts\dev.ps1 up` from a fresh set of volumes.
3. Verify the MinIO source build, private-bucket initialization, migration and service health.
4. Run `.\scripts\dev.ps1 test`; fix any real-service failures and record the actual output.
5. Verify readiness transitions, cold startup and restart persistence. CI is authored but has
   not run on GitHub; no remote repository was provided.
6. Only after Phase 0 passes, implement Phase 1 OIDC/JWKS, tenant/workspace memberships,
   restricted-document grants, audit records and API/repository permission-boundary tests.

Cloud infrastructure, provider credentials, evaluation data and deployment are later phases.
No fake answer endpoint, fabricated citations, fake ingestion task or no-op seed/eval command
was added to represent these future features as complete.

## 2026-10-11 — Glass UI refinement (user-requested)

Applied the user-provided apple-design skill from
`C:/Users/Sandhit/Downloads/apple-design/apple-design/SKILL.md` to the existing Phase 0 UI.
This is a visual and interaction refinement; it does not advance backend phase completion.

- Replaced the opaque sidebar with a floating frosted surface, soft ambient lighting,
  iridescent CSS glass artwork, system typography and lavender accents.
- Added persistent light/dark appearance, section navigation, expandable roadmap details,
  press/hover feedback and brief entrance transitions without new runtime dependencies.
- Kept the real API liveness fetch, timeout/error handling, refresh action and explicit
  labels that future domain features are planned.
- Added reduced-motion, reduced-transparency, contrast and no-backdrop-filter fallbacks;
  included a skip link, labelled controls and expanded-state semantics.
- Preserved accessible navigation labels when the mobile navigation becomes icon-only.

Verification: `npm run build` passed (TypeScript and Vite). Browser checks confirmed both
appearances, persistence across reload, roadmap expand/collapse and a successful API refresh.
Inspected desktop and phone layout using a temporary 390x844 browser viewport override
(the browser reported a 341 CSS-pixel content area at its current scaling). Fixed an orbit
that caused horizontal overflow; final content width and client width both measured 341px.
Restored the original viewport. Saved `docs/previews/glass-ui-light.png` from the actual page.
Accessibility preference styles were implemented and inspected in code; OS preference
emulation and a full assistive-technology audit were not performed.

## 2026-10-12 — Resume UI polish and persist design preference

- Saved the user's requested Apple-inspired glassmorphism default in global
  `C:/Users/Sandhit/.codex/AGENTS.md` and repository `AGENTS.md`. The global instruction
  was subsequently loaded into this active conversation, confirming discovery.
- Finished equal-height roadmap card alignment and synchronized the browser theme-color
  metadata with light/dark appearance.
- Re-ran `npm run build`: TypeScript check and Vite production build passed.
- Restarted the local Vite frontend (5173) and FastAPI API (8000).
- A fresh browser inspection was blocked by the browser URL security policy. Did not
  retry through alternate browsers or automation. The prior saved preview and prior
  desktop/mobile checks remain the visual evidence; no new screenshot is claimed.
- Docker is still unavailable, so real-service integration acceptance remains blocked.
