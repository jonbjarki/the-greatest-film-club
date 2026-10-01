"""initial_migration

Revision ID: 774dccb0247e
Revises: 
Create Date: 2026-09-28 15:12:36.071694

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '774dccb0247e'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    bind = op.get_bind()
    existing_tables = set(sa.inspect(bind).get_table_names())

    if "user" not in existing_tables:
        op.create_table(
            "user",
            sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
            sa.Column("username", sa.String(), nullable=False),
            sa.Column("hashed_password", sa.String(), nullable=False),
            sa.Column("is_admin", sa.Boolean(), nullable=False),
            sa.PrimaryKeyConstraint("id", name=op.f("user_pkey")),
        )
        op.create_index("ix_user_username", "user", ["username"], unique=True)
        existing_tables.add("user")

    if "movie" not in existing_tables:
        op.create_table(
            "movie",
            sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
            sa.Column("name", sa.String(), nullable=False),
            sa.Column("description", sa.String(), nullable=False),
            sa.Column("release_year", sa.Integer(), nullable=False),
            sa.Column("genres", sa.ARRAY(sa.String()), nullable=False),
            sa.Column("actor_names", sa.ARRAY(sa.String()), nullable=False),
            sa.Column("director_names", sa.ARRAY(sa.String()), nullable=False),
            sa.Column("backdrop_url", sa.String(), nullable=True),
            sa.Column("poster_url", sa.String(), nullable=True),
            sa.Column("user_id", sa.Integer(), nullable=True),
            sa.Column("added_at", sa.DateTime(), nullable=False),
            sa.ForeignKeyConstraint(
                ["user_id"], ["user.id"], name=op.f("movie_user_id_fkey")
            ),
            sa.PrimaryKeyConstraint("id", name=op.f("movie_pkey")),
        )
        existing_tables.add("movie")

    if "vote" not in existing_tables:
        op.create_table(
            "vote",
            sa.Column("user_id", sa.Integer(), nullable=False),
            sa.Column("movie_id", sa.Integer(), nullable=False),
            sa.ForeignKeyConstraint(
                ["movie_id"], ["movie.id"], name=op.f("vote_movie_id_fkey")
            ),
            sa.ForeignKeyConstraint(
                ["user_id"], ["user.id"], name=op.f("vote_user_id_fkey")
            ),
            sa.PrimaryKeyConstraint("user_id", "movie_id", name=op.f("vote_pkey")),
        )
        existing_tables.add("vote")

    if "refresh_sessions" not in existing_tables:
        op.create_table(
            "refresh_sessions",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("jti", sa.Uuid(), nullable=False),
            sa.Column("user_id", sa.Integer(), nullable=False),
            sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
            sa.Column("revoked_at", sa.DateTime(timezone=True), nullable=True),
            sa.ForeignKeyConstraint(
                ["user_id"], ["user.id"], name=op.f("refresh_sessions_user_id_fkey")
            ),
            sa.PrimaryKeyConstraint("id", name=op.f("refresh_sessions_pkey")),
        )
        existing_tables.add("refresh_sessions")

    refresh_indexes = {
        index["name"] for index in sa.inspect(bind).get_indexes("refresh_sessions")
    }
    refresh_jti_index = op.f("ix_refresh_sessions_jti")
    if refresh_jti_index not in refresh_indexes:
        op.create_index(
            refresh_jti_index, "refresh_sessions", ["jti"], unique=True
        )

    movie_columns = {column["name"]: column for column in sa.inspect(bind).get_columns("movie")}
    if movie_columns["user_id"]["nullable"]:
        op.alter_column(
            "movie",
            "user_id",
            existing_type=sa.INTEGER(),
            nullable=False,
        )


def downgrade() -> None:
    """Downgrade schema."""
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if inspector.has_table("movie"):
        movie_columns = {column["name"]: column for column in inspector.get_columns("movie")}
        if not movie_columns["user_id"]["nullable"]:
            op.alter_column(
                "movie",
                "user_id",
                existing_type=sa.INTEGER(),
                nullable=True,
            )

    if inspector.has_table("refresh_sessions"):
        refresh_indexes = {
            index["name"] for index in inspector.get_indexes("refresh_sessions")
        }
        refresh_jti_index = op.f("ix_refresh_sessions_jti")
        if refresh_jti_index in refresh_indexes:
            op.drop_index(refresh_jti_index, table_name="refresh_sessions")
        op.drop_table("refresh_sessions")
