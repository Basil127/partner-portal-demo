"""add_adults_children_to_reservations.

Revision ID: af7f1aba62d0
Revises: 97a9d00aafe4
Create Date: 2026-02-04 17:33:56.034447

"""

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "af7f1aba62d0"
down_revision = "97a9d00aafe4"
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Run the migration."""
    op.add_column(
        "reservations",
        sa.Column("number_of_adults", sa.Integer(), nullable=True),
    )
    op.add_column(
        "reservations",
        sa.Column("number_of_children", sa.Integer(), nullable=True),
    )


def downgrade() -> None:
    """Undo the migration."""
    op.drop_column("reservations", "number_of_children")
    op.drop_column("reservations", "number_of_adults")

