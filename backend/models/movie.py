from datetime import datetime
from typing import TYPE_CHECKING, List
import uuid
from sqlmodel import ARRAY, DateTime, Field, ForeignKey, Relationship, SQLModel, String

from models.user import User

if TYPE_CHECKING:
    from models.vote import Vote


class Movie(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    name: str
    description: str
    release_year: int
    genres: List[str] = Field(default_factory=list, sa_type=ARRAY(String))
    actor_names: List[str] = Field(default_factory=list, sa_type=ARRAY(String))
    director_names: List[str] = Field(default_factory=list, sa_type=ARRAY(String))
    backdrop_url: str | None = None
    poster_url: str | None = None
    user_id: uuid.UUID = Field(foreign_key="user.id")
    user: User = Relationship(back_populates="added_movies")
    added_at: datetime = Field(default_factory=datetime.now,
        sa_type=DateTime(timezone=True))
    votes: List["Vote"] = Relationship(back_populates="movie")
