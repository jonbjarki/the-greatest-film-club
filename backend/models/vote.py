from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel, UniqueConstraint
from .movie import Movie

if TYPE_CHECKING:
    from .user import User
    from .movie import Movie


class Vote(SQLModel, table=True):
    __table_args__ = (
        UniqueConstraint("movie_id", "user_id", name="unique_vote_movie_user"),
    )
    id: int = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    movie_id: int = Field(foreign_key="movie.id")
    user: User = Relationship(back_populates="votes")
    movie: Movie = Relationship(back_populates="votes")
