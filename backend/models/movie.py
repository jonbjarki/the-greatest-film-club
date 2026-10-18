from sqlmodel import ARRAY, Field, Relationship, SQLModel, String

from models.movie_night import MovieNightMovie


class Movie(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)

    name: str
    description: str
    release_year: int

    genres: list[str] = Field(default_factory=list, sa_type=ARRAY(String))
    actor_names: list[str] = Field(default_factory=list, sa_type=ARRAY(String))
    director_names: list[str] = Field(default_factory=list, sa_type=ARRAY(String))

    backdrop_url: str | None = None
    poster_url: str | None = None

    movie_night_entries: list[MovieNightMovie] = Relationship(back_populates="movie")


class MovieError(SQLModel):
    error: str


class MovieRead(SQLModel):
    id: int
    name: str
    description: str | None
    genres: list[str]
    actor_names: list[str]
    director_names: list[str]
    backdrop_url: str | None
    poster_url: str | None
    release_year: int | None
