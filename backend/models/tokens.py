import uuid
from datetime import UTC, datetime

from sqlmodel import DateTime, Field, SQLModel


class UserSession(SQLModel, table=True):
    """A login session. The client holds a random token; only its sha256 hash is stored."""

    __tablename__ = "user_session"

    id: uuid.UUID = Field(default_factory=uuid.uuid7, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id", index=True, ondelete="CASCADE")
    token_hash: str = Field(unique=True, index=True)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(UTC),
        sa_type=DateTime(timezone=True),
    )
    expires_at: datetime = Field(sa_type=DateTime(timezone=True))
