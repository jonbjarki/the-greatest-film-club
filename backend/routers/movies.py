from fastapi import APIRouter, Depends
from typing_extensions import Annotated
from sqlmodel import Session
import requests
import os
from ..auth import get_current_active_user
from ..database import engine
from ..models.movie import Movie
from ..models.user import User

def build_image_url(path: str | None) -> str | None:
    return f"https://image.tmdb.org/t/p/w500/{path}" if path else None


def get_movie(id: int):
    result = requests.get(os.environ.get("API_BASE_URL") + f"/movie/{id}", headers={"Authorization": "Bearer " + os.environ.get("API_KEY")})
    return result.json()

def get_credits(id: int):
    result = requests.get(os.environ.get("API_BASE_URL") + f"/movie/{id}/credits", headers={"Authorization": "Bearer " + os.environ.get("API_KEY")})
    return result.json()



router = APIRouter(prefix="/movies", tags=["movies"])

@router.post("/movie/{id}")
async def root(id: int, current_user: Annotated[User, Depends(get_current_active_user)]):
    print("USER", current_user)
    movie = get_movie(id)
    credits = get_credits(id)
    
    new_movie = Movie(
        id=movie["id"],
        name=movie["title"],
        description=movie["overview"],
        genres=[genre["name"] for genre in movie.get("genres", [])],
        actor_names=[actor["name"] for actor in credits.get("cast", []) if actor["known_for_department"] == "Acting"][:5],
        director_names=[director["name"] for director in credits.get("crew", []) if director["job"] == "Director"],
        backdrop_url=build_image_url(movie.get("backdrop_path")),
        poster_url=build_image_url(movie.get("poster_path"))
    )

    with Session(engine) as session:
        session.add(new_movie)
        session.commit()       # Commit transaction to Postgres
        session.refresh(new_movie)
        print(f"Created movie with ID: {new_movie.id}")

    return {"movie": new_movie}