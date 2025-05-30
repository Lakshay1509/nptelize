"""remove unique constraint for nptel_course_code

Revision ID: 2af31e69acd9
Revises: 08efb1a7ad99
Create Date: 2025-05-28 15:42:01.900212

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2af31e69acd9'
down_revision: Union[str, None] = '08efb1a7ad99'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint('uq_subjects_nptel_course_code', 'subjects', type_='unique')
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_unique_constraint('uq_subjects_nptel_course_code', 'subjects', ['nptel_course_code'], postgresql_nulls_not_distinct=False)
    # ### end Alembic commands ###
