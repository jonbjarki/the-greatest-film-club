from datetime import datetime, timedelta, timezone
import uuid
from sqlmodel import UUID, SQLModel, Field


class RefreshSession(SQLModel, table=True):
    __tablename__ = "refresh_sessions"
    id: int = Field(primary_key=True)
    jti: uuid.UUID = Field(unique=True, index=True)
    user_id: int = Field(foreign_key="user.id")
    expires_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc) + timedelta(days=7)
    )
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    revoked_at: datetime | None = Field(default=None)
