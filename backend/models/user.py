from datetime import datetime, timedelta, timezone
from typing import List
from typing import TYPE_CHECKING
from sqlmodel import Column, DateTime, Field, Relationship, SQLModel

if TYPE_CHECKING:
    from .movie import Movie
    from .vote import Vote


class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True)
    hashed_password: str
    is_admin: bool = False
    added_movies: List["Movie"] = Relationship(back_populates="user")
    votes: List["Vote"] = Relationship(back_populates="user")


class RefreshToken(SQLModel, table=True):
    __tablename__ = "refresh_tokens"
    id: int = Field(primary_key=True)
    token: str = Field(unique=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    expires_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc) + timedelta(days=7)
    )
