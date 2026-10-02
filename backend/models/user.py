from datetime import datetime, timedelta, timezone
from typing import List
from typing import TYPE_CHECKING
import uuid
from sqlmodel import Column, DateTime, Field, Relationship, SQLModel, func

if TYPE_CHECKING:
    from .movie import Movie
    from .vote import Vote

class UserBase(SQLModel):
    username: str
    image_url: str | None
    bio: str | None
    created_at: datetime

class UserRead(UserBase):
    id: uuid.UUID

class UserUpdate(UserBase):
    username: str | None = None
    image_url: str | None = None
    bio: str | None = None

class User(SQLModel, table=True):
    id: uuid.UUID | None = Field(default=uuid.uuid7, primary_key=True)
    username: str = Field(index=True, unique=True)
    image_url: str | None = None
    bio: str | None = None
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column_kwargs={"server_default": func.now()}
    )
    hashed_password: str
    is_admin: bool = False
    added_movies: List["Movie"] = Relationship(back_populates="user")
    votes: List["Vote"] = Relationship(back_populates="user")
