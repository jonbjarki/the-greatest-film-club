from datetime import datetime, timezone
from typing import TYPE_CHECKING, List, ForwardRef
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
    added_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc),
        sa_type=DateTime(timezone=True))
    votes: List["Vote"] = Relationship(back_populates="movie")

class VotedUser(SQLModel):
    id: uuid.UUID
    username: str
    image_url: str | None

class MovieError(SQLModel):
    error: str

class MovieDetails(SQLModel):
    id: int
    name: str
    description: str | None
    genres: list[str]
    actor_names: list[str]
    director_names: list[str]
    backdrop_url: str | None
    poster_url: str | None
    release_year: int | None
    user_id: uuid.UUID
    added_at: str
    added_by: str | None
    vote_count: int
    user_voted: bool
    voted_users: list[VotedUser]
    
class MovieListResponse(SQLModel):
    results: list[MovieDetails]
    page: int
    total_pages: int
    total_results: int