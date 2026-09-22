from fastapi import APIRouter, Depends, Response
from typing_extensions import Annotated
from sqlmodel import Session, func, select
import requests
import os

from response_models.movies import MovieListResponse
from auth import get_current_active_user
from database import engine
from models.movie import Movie
from models.user import User
from models.vote import Vote

PAGE_SIZE = 10


def build_tmdb_image_url(path: str | None) -> str | None:
    return f"https://image.tmdb.org/t/p/w500/{path}" if path else None


def get_tmdb_movie(id: int):
    result = requests.get(
        os.environ.get("TMDB_BASE_URL") + f"/movie/{id}",
        headers={"Authorization": "Bearer " + os.environ.get("API_KEY")},
    )
    return result.json()


def get_tmdb_credits(id: int):
    result = requests.get(
        os.environ.get("TMDB_BASE_URL") + f"/movie/{id}/credits",
        headers={"Authorization": "Bearer " + os.environ.get("API_KEY")},
    )
    return result.json()


router = APIRouter(prefix="/movies", tags=["movies"])


@router.get("/")
async def list_movies(
    current_user: Annotated[User, Depends(get_current_active_user)],
    page: int | None = 1,
) -> MovieListResponse:
    with Session(engine) as session:
        count = session.exec(select(func.count(Movie.id))).first() or 0

        vote_count_subq = (
            select(Vote.movie_id, func.count(Vote.user_id).label("vote_count"))
            .group_by(Vote.movie_id)
            .subquery()
        )

        statement = (
            select(Movie, func.coalesce(vote_count_subq.c.vote_count, 0))
            .join(vote_count_subq, vote_count_subq.c.movie_id == Movie.id, isouter=True)
            .offset((page - 1) * PAGE_SIZE)
            .limit(PAGE_SIZE)
        )
        rows = session.exec(statement).all()
        movie_ids = [movie.id for movie, _ in rows]

        voted_ids = set(
            session.exec(
                select(Vote.movie_id).where(
                    Vote.user_id == current_user.id, Vote.movie_id.in_(movie_ids)
                )
            ).all()
        )

        return MovieListResponse(
            results=[
                {
                    **movie.model_dump(),
                    "added_at": movie.added_at.isoformat(),
                    "added_by": movie.user.username,
                    "vote_count": vote_count,
                    "user_voted": movie.id in voted_ids,
                }
                for movie, vote_count in rows
            ],
            page=page,
            total_pages=(count + PAGE_SIZE - 1) // PAGE_SIZE,
            total_results=count,
        )


@router.post("/{id}", status_code=201)
async def add_movie_from_tmdb(
    id: int,
    current_user: Annotated[User, Depends(get_current_active_user)],
    response: Response,
):
    with Session(engine) as session:
        existing_movie = session.get(Movie, id)
        if existing_movie:
            response.status_code = 409
            return {"error": "Movie already exists"}

    movie = get_tmdb_movie(id)
    credits = get_tmdb_credits(id)
    release_date = movie.get("release_date")
    release_year = int(release_date[:4]) if release_date else None
    new_movie = Movie(
        id=movie["id"],
        name=movie["title"],
        description=movie["overview"],
        genres=[genre["name"] for genre in movie.get("genres", [])],
        actor_names=[
            actor["name"]
            for actor in credits.get("cast", [])
            if actor["known_for_department"] == "Acting"
        ][:5],
        director_names=[
            director["name"]
            for director in credits.get("crew", [])
            if director["job"] == "Director"
        ],
        backdrop_url=build_tmdb_image_url(movie.get("backdrop_path")),
        poster_url=build_tmdb_image_url(movie.get("poster_path")),
        release_year=release_year,
        user_id=current_user.id,
    )

    with Session(engine) as session:
        session.add(new_movie)
        session.commit()
        session.refresh(new_movie)
        print(f"Created movie with ID: {new_movie.id}")

    response.headers["Location"] = f"/movies/{new_movie.id}"
    return {"message": f"Movie {new_movie.id} created"}


@router.post("/{id}/vote")
async def vote_movie(
    id: int,
    response: Response,
    current_user: Annotated[User, Depends(get_current_active_user)],
):
    with Session(engine) as session:
        movie = session.get(Movie, id)
        if not movie:
            response.status_code = 404
            return {"error": "Movie not found"}
        existing_vote = session.exec(
            select(Vote).where(Vote.user_id == current_user.id, Vote.movie_id == id)
        ).first()
        if existing_vote:
            response.status_code = 409
            return {"error": "User has already voted for this movie"}

        new_vote = Vote(user_id=current_user.id, movie_id=id)
        session.add(new_vote)
        session.commit()
        session.refresh(new_vote)
        return {"message": f"User {current_user.id} voted for movie {id}"}


@router.post("/{id}/unvote")
async def unvote_movie(
    id: int,
    response: Response,
    current_user: Annotated[User, Depends(get_current_active_user)],
):
    with Session(engine) as session:
        movie = session.get(Movie, id)
        if not movie:
            response.status_code = 404
            return {"error": "Movie not found"}

        existing_vote = session.exec(
            select(Vote).where(Vote.user_id == current_user.id, Vote.movie_id == id)
        ).first()
        if not existing_vote:
            response.status_code = 404
            return {"error": "Vote not found"}

        session.delete(existing_vote)
        session.commit()
        return {"message": f"User {current_user.id} removed vote for movie {id}"}


@router.get("/tmdb/search")
async def search_tmdb(query: str):
    result = requests.get(
        os.environ.get("TMDB_BASE_URL") + f"/search/movie?query={query}",
        headers={"Authorization": "Bearer " + os.environ.get("API_KEY")},
    )
    data = result.json()
    return {
        "results": [
            {
                "title": movie["title"],
                "id": movie["id"],
                "release_year": (
                    int(movie["release_date"][:4])
                    if movie.get("release_date")
                    else None
                ),
            }
            for movie in data.get("results", [])[:10]  # Limit to top 10 results
        ]
    }
