from fastapi import HTTPException
from httpx import AsyncClient
from sqlmodel.ext.asyncio.session import AsyncSession

from config import Config
from models.movie import Movie

PAGE_SIZE = 12
TMDB_BASE_URL = Config.TMDB_BASE_URL
TMDB_API_KEY = Config.API_KEY


def build_tmdb_image_url(path: str | None) -> str | None:
    return f"https://image.tmdb.org/t/p/w500{path}" if path else None


async def get_tmdb_movie(id: int):
    """
    Get the details of a movie from TMDB.

    Args:
        id (int): The TMDB ID of the movie.

    Returns:
        dict: The movie details.
    """
    async with AsyncClient() as client:
        result = await client.get(
            TMDB_BASE_URL + f"/movie/{id}",
            headers={"Authorization": "Bearer " + TMDB_API_KEY},
        )
        if result.status_code != 200:
            raise HTTPException(
                status_code=result.status_code,
                detail="Failed to fetch movie details from TMDB",
            )
        return result.json()


async def get_tmdb_credits(id: int):
    """
    Get the credits (cast and crew) for a movie from TMDB.

    Args:
        id (int): The TMDB ID of the movie.

    Returns:
        dict: The credits information for the movie.
    """
    async with AsyncClient() as client:
        result = await client.get(
            TMDB_BASE_URL + f"/movie/{id}/credits",
            headers={"Authorization": "Bearer " + TMDB_API_KEY},
        )
        if result.status_code != 200:
            raise HTTPException(
                status_code=result.status_code,
                detail="Failed to fetch movie credits from TMDB",
            )
        return result.json()


async def create_movie_from_tmdb_id(
    tmdb_id: int,
    session: AsyncSession,
):
    """
    Create a new Movie instance from a TMDB ID.

    Args:
        tmdb_id (int): The TMDB ID of the movie to create.
        session (AsyncSession): The database session.

    Returns:
        Movie: The newly created Movie instance.

    Raises:
        HTTPException: If the movie already exists in the database.
    """
    existing_movie = await session.get(Movie, tmdb_id)
    if existing_movie:
        raise HTTPException(status_code=409, detail="Movie already exists")

    movie = await get_tmdb_movie(tmdb_id)
    credits = await get_tmdb_credits(tmdb_id)
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
    )

    session.add(new_movie)
    await session.commit()
    await session.refresh(new_movie)
    return new_movie


async def search_tmdb(query: str):
    async with AsyncClient() as client:
        result = await client.get(
            TMDB_BASE_URL + f"/search/movie?query={query}",
            headers={"Authorization": "Bearer " + TMDB_API_KEY},
        )
        if result.status_code != 200:
            raise HTTPException(
                status_code=result.status_code, detail="Failed to search movies on TMDB"
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
