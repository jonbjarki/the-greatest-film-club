from fastapi import APIRouter, Depends, Response
from typing_extensions import Annotated
from sqlmodel import func, select
from sqlalchemy.orm import selectinload
from sqlmodel.ext.asyncio.session import AsyncSession
import requests

from config import Config
from auth import get_current_active_user
from database import get_session
from models.movie import Movie, MovieDetails, MovieError, MovieListResponse
from models.user import User
from models.vote import Vote

PAGE_SIZE = 12
TMDB_BASE_URL = Config.TMDB_BASE_URL
TMDB_API_KEY = Config.API_KEY

def build_tmdb_image_url(path: str | None) -> str | None:
    return f"https://image.tmdb.org/t/p/w500{path}" if path else None


def get_tmdb_movie(id: int):
    result = requests.get(
        TMDB_BASE_URL + f"/movie/{id}",
        headers={"Authorization": "Bearer " + TMDB_API_KEY},
    )
    return result.json()


def get_tmdb_credits(id: int):
    result = requests.get(
        TMDB_BASE_URL + f"/movie/{id}/credits",
        headers={"Authorization": "Bearer " + TMDB_API_KEY},
    )
    return result.json()


router = APIRouter(prefix="/movies", tags=["movies"])


@router.get("")
async def list_movies(
    current_user: Annotated[User, Depends(get_current_active_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
    page: int | None = 1,
    page_size: int | None = PAGE_SIZE,
) -> MovieListResponse:
    count_result = await session.exec(select(func.count(Movie.id)))
    count = count_result.first() or 0

    statement = (
        select(Movie)
        .options(
            selectinload(Movie.user),
            selectinload(Movie.votes).selectinload(Vote.user),
        )
        .order_by(Movie.added_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    movies = (await session.exec(statement)).all()

    movie_ids = [movie.id for movie in movies]
    voted_rows = await session.exec(
        select(Vote.movie_id).where(
            Vote.user_id == current_user.id, Vote.movie_id.in_(movie_ids)
        )
    )
    voted_ids = set(voted_rows.all())

    return MovieListResponse(
        results=[
            {
                **movie.model_dump(exclude={"votes"}),
                "added_at": movie.added_at.isoformat(),
                "added_by": movie.user.username,
                "vote_count": len(movie.votes),
                "user_voted": movie.id in voted_ids,
                "voted_users": [
                    {
                        "id": vote.user.id,
                        "username": vote.user.username,
                        "image_url": vote.user.image_url,
                    }
                    for vote in movie.votes
                ],
            }
            for movie in movies
        ],
        page=page,
        total_pages=(count + page_size - 1) // page_size,
        total_results=count,
    )


@router.post("/{id}", status_code=201)
async def add_movie_from_tmdb(
    id: int,
    current_user: Annotated[User, Depends(get_current_active_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
    response: Response,
):
    existing_movie = await session.get(Movie, id)
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

    session.add(new_movie)
    await session.commit()
    await session.refresh(new_movie)

    response.headers["Location"] = f"/movies/{new_movie.id}"
    return {"message": f"Movie {new_movie.id} created"}


@router.post("/{id}/vote", response_model=MovieDetails | MovieError)
async def vote_movie(
    id: int,
    response: Response,
    current_user: Annotated[User, Depends(get_current_active_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> MovieDetails | MovieError:
    movie = await session.get(Movie, id)
    if not movie:
        response.status_code = 404
        return {"error": "Movie not found"}
    
    existing_vote = await session.exec(
        select(Vote).where(Vote.user_id == current_user.id, Vote.movie_id == id)
    )
    
    if existing_vote.first():
        response.status_code = 409
        return {"error": "User has already voted for this movie"}

    new_vote = Vote(user_id=current_user.id, movie_id=id)
    session.add(new_vote)
    await session.commit()

    statement = select(Movie).where(Movie.id == id).options(
        selectinload(Movie.user),
        selectinload(Movie.votes).selectinload(Vote.user),
    )
    movie = (await session.exec(statement)).first()

    return {
        **movie.model_dump(exclude={"votes"}),
        "added_at": movie.added_at.isoformat(),
        "added_by": movie.user.username,
        "vote_count": len(movie.votes),
        "user_voted": any(vote.user_id == current_user.id for vote in movie.votes),
        "voted_users": [
            {
                "id": vote.user.id,
                "username": vote.user.username,
                "image_url": vote.user.image_url,
            }
            for vote in movie.votes
        ],
    }


@router.post("/{id}/unvote", response_model=MovieDetails | MovieError)
async def unvote_movie(
    id: int,
    response: Response,
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_active_user)],
) -> MovieDetails | MovieError:
    movie = await session.get(Movie, id)
    if not movie:
        response.status_code = 404
        return {"error": "Movie not found"}

    existing_vote = (
        await session.exec(
            select(Vote).where(Vote.user_id == current_user.id, Vote.movie_id == id)
        )
    ).first()
    if not existing_vote:
        response.status_code = 404
        return {"error": "Vote not found"}

    await session.delete(existing_vote)
    await session.commit()

    statement = select(Movie).where(Movie.id == id).options(
        selectinload(Movie.user),
        selectinload(Movie.votes).selectinload(Vote.user),
    )
    movie = (await session.exec(statement)).first()

    return {
        **movie.model_dump(exclude={"votes"}),
        "added_at": movie.added_at.isoformat(),
        "added_by": movie.user.username,
        "vote_count": len(movie.votes),
        "user_voted": any(vote.user_id == current_user.id for vote in movie.votes),
        "voted_users": [
            {
                "id": vote.user.id,
                "username": vote.user.username,
                "image_url": vote.user.image_url,
            }
            for vote in movie.votes
        ],
    }


@router.get("/tmdb/search")
async def search_tmdb(query: str):
    result = requests.get(
        TMDB_BASE_URL + f"/search/movie?query={query}",
        headers={"Authorization": "Bearer " + TMDB_API_KEY},
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
