from uuid import UUID

from sqlmodel import SQLModel


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
    user_id: UUID
    added_at: str
    added_by: str | None
    vote_count: int
    user_voted: bool


class MovieListResponse(SQLModel):
    results: list[MovieDetails]
    page: int
    total_pages: int
    total_results: int
