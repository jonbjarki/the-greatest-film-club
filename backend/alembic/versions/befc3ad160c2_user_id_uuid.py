"""user_id_uuid

Revision ID: befc3ad160c2
Revises: 774dccb0247e
Create Date: 2026-09-28 15:15:10.211687

"""

from typing import Sequence, Union
import uuid

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "befc3ad160c2"
down_revision: Union[str, Sequence[str], None] = "774dccb0247e"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

FK_TABLES = [
    "movie",
    "refresh_sessions",
    "vote",
]


def upgrade() -> None:
    """Upgrade schema."""
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    # ---------------------------------------------------------
    # 1. Remember existing PK/FK constraint information
    # ---------------------------------------------------------

    user_pk = inspector.get_pk_constraint("user")
    user_pk_name = user_pk["name"]
    vote_pk = inspector.get_pk_constraint("vote")
    vote_pk_name = vote_pk["name"]
    if vote_pk["constrained_columns"] != ["user_id", "movie_id"]:
        raise RuntimeError("Expected vote primary key on (user_id, movie_id)")

    foreign_keys = {}

    for table_name in FK_TABLES:
        for fk in inspector.get_foreign_keys(table_name):
            if (
                fk["constrained_columns"] == ["user_id"]
                and fk["referred_table"] == "user"
            ):
                foreign_keys[table_name] = fk
                break

        if table_name not in foreign_keys:
            raise RuntimeError(
                f"Could not find user_id -> user.id foreign key on {table_name}"
            )

    # ---------------------------------------------------------
    # 2. Add temporary UUID columns
    # ---------------------------------------------------------

    op.add_column(
        "user",
        sa.Column("new_id", sa.Uuid(), nullable=True),
    )

    for table_name in FK_TABLES:
        op.add_column(
            table_name,
            sa.Column("new_user_id", sa.Uuid(), nullable=True),
        )

    # ---------------------------------------------------------
    # 3. Generate a completely new UUID for every existing user
    # ---------------------------------------------------------

    user_table = sa.table(
        "user",
        sa.column("id", sa.Integer()),
        sa.column("new_id", sa.Uuid()),
    )

    existing_user_ids = bind.execute(sa.select(user_table.c.id)).scalars().all()

    if existing_user_ids:
        bind.execute(
            user_table.update()
            .where(user_table.c.id == sa.bindparam("old_id"))
            .values(new_id=sa.bindparam("uuid_id")),
            [
                {
                    "old_id": user_id,
                    "uuid_id": uuid.uuid4(),
                }
                for user_id in existing_user_ids
            ],
        )

    # ---------------------------------------------------------
    # 4. Copy UUIDs into all referencing tables
    #
    # old:
    # user.id = 5
    # movie.user_id = 5
    #
    # new:
    # user.new_id = abc...
    # movie.new_user_id = abc...
    # ---------------------------------------------------------

    for table_name in FK_TABLES:
        child_table = sa.table(
            table_name,
            sa.column("user_id", sa.Integer()),
            sa.column("new_user_id", sa.Uuid()),
        )

        user_uuid = (
            sa.select(user_table.c.new_id)
            .where(user_table.c.id == child_table.c.user_id)
            .scalar_subquery()
        )

        bind.execute(child_table.update().values(new_user_id=user_uuid))

    # ---------------------------------------------------------
    # 5. Make sure migration succeeded before destroying
    #    old relationship
    # ---------------------------------------------------------

    missing_user_uuid = bind.execute(
        sa.select(sa.func.count())
        .select_from(user_table)
        .where(user_table.c.new_id.is_(None))
    ).scalar_one()

    if missing_user_uuid:
        raise RuntimeError(f"{missing_user_uuid} users did not receive UUIDs")

    for table_name in FK_TABLES:
        child_table = sa.table(
            table_name,
            sa.column("new_user_id", sa.Uuid()),
        )

        missing_fk_uuid = bind.execute(
            sa.select(sa.func.count())
            .select_from(child_table)
            .where(child_table.c.new_user_id.is_(None))
        ).scalar_one()

        if missing_fk_uuid:
            raise RuntimeError(
                f"{missing_fk_uuid} rows in {table_name} "
                "could not be mapped to a user UUID"
            )

    # ---------------------------------------------------------
    # 6. Drop foreign keys referencing the old integer ID
    # ---------------------------------------------------------

    for table_name, fk in foreign_keys.items():
        op.drop_constraint(
            fk["name"],
            table_name,
            type_="foreignkey",
        )

    # ---------------------------------------------------------
    # 7. Drop old user PK
    # ---------------------------------------------------------

    op.drop_constraint(
        user_pk_name,
        "user",
        type_="primary",
    )
    op.drop_constraint(
        vote_pk_name,
        "vote",
        type_="primary",
    )

    # ---------------------------------------------------------
    # 8. Remove integer columns
    # ---------------------------------------------------------

    for table_name in FK_TABLES:
        op.drop_column(table_name, "user_id")

    op.drop_column("user", "id")

    # ---------------------------------------------------------
    # 9. Rename UUID columns to the original column names
    # ---------------------------------------------------------

    op.alter_column(
        "user",
        "new_id",
        new_column_name="id",
        nullable=False,
    )

    for table_name in FK_TABLES:
        op.alter_column(
            table_name,
            "new_user_id",
            new_column_name="user_id",
            nullable=False,
        )

    # ---------------------------------------------------------
    # 10. Recreate primary key
    # ---------------------------------------------------------

    op.create_primary_key(
        user_pk_name,
        "user",
        ["id"],
    )
    op.create_primary_key(
        vote_pk_name,
        "vote",
        ["user_id", "movie_id"],
    )

    # ---------------------------------------------------------
    # 11. Recreate foreign keys with their previous behavior
    # ---------------------------------------------------------

    for table_name, fk in foreign_keys.items():
        options = fk.get("options") or {}

        op.create_foreign_key(
            constraint_name=fk["name"],
            source_table=table_name,
            referent_table="user",
            local_cols=["user_id"],
            remote_cols=["id"],
            onupdate=options.get("onupdate"),
            ondelete=options.get("ondelete"),
            deferrable=options.get("deferrable"),
            initially=options.get("initially"),
            match=options.get("match"),
        )


def downgrade() -> None:
    raise NotImplementedError(
        "This migration cannot safely restore the original integer user IDs."
    )
