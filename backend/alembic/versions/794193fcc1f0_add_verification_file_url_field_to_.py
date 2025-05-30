"""add verification_file_url field to certificates

Revision ID: 794193fcc1f0
Revises: a4c0e7f6eded
Create Date: 2025-05-19 14:28:07.765895

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '794193fcc1f0'
down_revision: Union[str, None] = 'a4c0e7f6eded'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('certificates', sa.Column('verification_file_url', sa.Text(), nullable=True))
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('certificates', 'verification_file_url')
    # ### end Alembic commands ###
