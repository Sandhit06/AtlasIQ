"""Install shared PostgreSQL extensions; domain schema follows in Phase 1."""

from alembic import op

revision = "0001_platform"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")
    op.execute("CREATE EXTENSION IF NOT EXISTS pgcrypto")


def downgrade() -> None:
    # Shared extensions can be used by other schemas; rollback never drops them.
    pass
