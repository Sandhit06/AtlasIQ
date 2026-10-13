.PHONY: up down migrate test check integration openapi
up:
	docker compose up --build -d --wait
down:
	docker compose down
migrate:
	docker compose run --rm migrate
test:
	docker compose --profile test run --build --rm test
check:
	uv run --locked ruff check .
	uv run --locked ruff format --check .
	uv run --locked mypy src apps/api apps/worker
	uv run --locked pytest -m "not integration" -q
integration: test
openapi:
	uv run --locked python scripts/export_openapi.py
