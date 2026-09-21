from pydantic import BaseModel


class MovieDetails(BaseModel):
    id: int
    name: str
    description: str | None
    genres: list[str]
    actor_names: list[str]
    director_names: list[str]
    backdrop_url: str | None
    poster_url: str | None
    release_year: int | None
    user_id: int
    added_at: str
    added_by: str | None
    vote_count: int
    user_voted: bool


class MovieListResponse(BaseModel):
    results: list[MovieDetails]
    page: int
    total_pages: int
    total_results: int
