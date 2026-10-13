"""Export the implemented API contract without requiring external services."""

import json
from pathlib import Path

from apps.api.main import app

target = Path(__file__).resolve().parents[1] / "docs" / "openapi.json"
target.parent.mkdir(parents=True, exist_ok=True)
target.write_text(json.dumps(app.openapi(), indent=2) + "\n", encoding="utf-8")
print(target)
