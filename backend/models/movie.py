from typing import List
from sqlmodel import ARRAY, Field, SQLModel, String

class Movie(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    name: str
    description: str
    genres: List[str] = Field(
        default_factory=list,
        sa_type=ARRAY(String)
    )
    actor_names: List[str] = Field(
        default_factory=list,
        sa_type=ARRAY(String)
    )
    director_names: List[str] = Field(
        default_factory=list,
        sa_type=ARRAY(String)
    )
    backdrop_url: str | None = None
    poster_url: str | None = None
