import uuid
from datetime import UTC, datetime
from typing import TYPE_CHECKING

from sqlalchemy import UniqueConstraint
from sqlmodel import DateTime, Field, Relationship, SQLModel

if TYPE_CHECKING:
    from models.movie import Movie, MovieRead
    from models.user import User


class MovieNightBase(SQLModel):
    title: str = Field(min_length=4, max_length=40)
    description: str | None = Field(default=None, min_length=4, max_length=200)
    club_id: int = Field(foreign_key="club.id")
    deadline: datetime | None = Field(sa_type=DateTime(timezone=True), default=None)


class MovieNightCreate(MovieNightBase):
    pass


class MovieNightMovieRead(SQLModel):
    movie: MovieRead

    added_at: datetime
    added_by: str

    vote_count: int
    user_voted: bool


class MovieNightMovie(SQLModel, table=True):
    __tablename__ = "movie_night_movie"

    __table_args__ = (
        UniqueConstraint("movie_night_id", "movie_id", name="uq_movie_night_movie"),
    )

    id: int | None = Field(default=None, primary_key=True)
    movie_night_id: int = Field(foreign_key="movie_night.id")
    movie_id: int = Field(foreign_key="movie.id")
    added_by_id: uuid.UUID = Field(foreign_key="user.id")

    added_at: datetime = Field(
        default_factory=lambda: datetime.now(UTC),
        sa_type=DateTime(timezone=True),
    )

    movie_night: MovieNight = Relationship(back_populates="movie_entries")
    movie: Movie = Relationship(back_populates="movie_night_entries")
    added_by: User = Relationship()
    votes: list[MovieNightVote] = Relationship(back_populates="movie_entry")


class MovieNightVote(SQLModel, table=True):
    __tablename__ = "movie_night_vote"

    movie_night_movie_id: int = Field(
        foreign_key="movie_night_movie.id", primary_key=True
    )
    user_id: uuid.UUID = Field(
        foreign_key="user.id",
        primary_key=True,
    )

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(UTC),
        sa_type=DateTime(timezone=True),
    )

    movie_entry: MovieNightMovie = Relationship(back_populates="votes")


class MovieNight(MovieNightBase, table=True):
    __tablename__ = "movie_night"
    id: int | None = Field(primary_key=True, default=None)
    movie_entries: list[MovieNightMovie] = Relationship(back_populates="movie_night")
