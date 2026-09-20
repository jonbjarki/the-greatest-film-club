from fastapi import APIRouter, Depends, Response
from typing_extensions import Annotated
from sqlmodel import Session, select
import requests
import os
from ..auth import get_current_active_user
from ..database import engine
from ..models.movie import Movie
from ..models.user import User
from ..models.vote import Vote


def build_image_url(path: str | None) -> str | None:
    return f"https://image.tmdb.org/t/p/w500/{path}" if path else None


def get_movie(id: int):
    result = requests.get(
        os.environ.get("API_BASE_URL") + f"/movie/{id}",
        headers={"Authorization": "Bearer " + os.environ.get("API_KEY")},
    )
    return result.json()


def get_credits(id: int):
    result = requests.get(
        os.environ.get("API_BASE_URL") + f"/movie/{id}/credits",
        headers={"Authorization": "Bearer " + os.environ.get("API_KEY")},
    )
    return result.json()


router = APIRouter(prefix="/movies", tags=["movies"])


@router.get("/")
async def list_movies():
    with Session(engine) as session:
        movies = session.exec(select(Movie)).all()

        return [
            {**movie.model_dump(), "vote_count": len(movie.votes)} for movie in movies
        ]


@router.post("/{id}")
async def root(
    id: int, current_user: Annotated[User, Depends(get_current_active_user)]
):
    movie = get_movie(id)
    credits = get_credits(id)
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
        backdrop_url=build_image_url(movie.get("backdrop_path")),
        poster_url=build_image_url(movie.get("poster_path")),
        release_year=release_year,
        user_id=current_user.id,
    )

    with Session(engine) as session:
        session.add(new_movie)
        session.commit()  # Commit transaction to Postgres
        session.refresh(new_movie)
        print(f"Created movie with ID: {new_movie.id}")

    return new_movie


@router.post("/{id}/vote")
async def vote_movie(
    id: int,
    response: Response,
    current_user: Annotated[User, Depends(get_current_active_user)],
):
    with Session(engine) as session:
        movie = session.get(Movie, id)
        if not movie:
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
