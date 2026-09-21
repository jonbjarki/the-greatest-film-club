from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel, UniqueConstraint
from .movie import Movie

if TYPE_CHECKING:
    from .user import User
    from .movie import Movie


class Vote(SQLModel, table=True):
    user_id: int = Field(foreign_key="user.id", primary_key=True)
    movie_id: int = Field(foreign_key="movie.id", primary_key=True)
    user: User = Relationship(back_populates="votes")
    movie: Movie = Relationship(back_populates="votes")
