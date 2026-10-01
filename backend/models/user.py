from datetime import datetime, timedelta, timezone
from typing import List
from typing import TYPE_CHECKING
import uuid
from sqlmodel import Column, DateTime, Field, Relationship, SQLModel

if TYPE_CHECKING:
    from .movie import Movie
    from .vote import Vote


class User(SQLModel, table=True):
    id: uuid.UUID | None = Field(default=uuid.uuid7, primary_key=True)
    username: str = Field(index=True, unique=True)
    hashed_password: str
    is_admin: bool = False
    added_movies: List["Movie"] = Relationship(back_populates="user")
    votes: List["Vote"] = Relationship(back_populates="user")
