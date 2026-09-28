from datetime import datetime, timedelta, timezone
import uuid
from sqlmodel import SQLModel, Field, DateTime


class RefreshSession(SQLModel, table=True):
    __tablename__ = "refresh_sessions"
    id: int = Field(primary_key=True)
    jti: uuid.UUID = Field(unique=True, index=True)
    user_id: uuid.UUID = Field(foreign_key="user.id")
    expires_at: datetime = Field(
        sa_type=DateTime(timezone=True),
        default_factory=lambda: datetime.now(timezone.utc) + timedelta(days=7),
    )
    created_at: datetime = Field(
        sa_type=DateTime(timezone=True),
        default_factory=lambda: datetime.now(timezone.utc),
    )
