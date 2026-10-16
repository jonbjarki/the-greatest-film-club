from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from auth import get_current_user
from dal.movies import create_movie_from_tmdb_id, search_tmdb
from database import get_session
from models.club import Club, ClubMemberStatus, ClubRole, ClubUser
from models.movie import Movie
from models.movie_night import (
    MovieNight,
    MovieNightCreate,
    MovieNightMovie,
    MovieNightRead,
    MovieNightVote,
    MovieNightVoteRead,
)
from models.user import User

router = APIRouter(tags=["Movie Night"], prefix="/movie-nights")


@router.post("/")
async def create_movie_night(
    data: MovieNightCreate,
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    club = await session.get(Club, data.club_id)

    if not club:
        raise HTTPException(status_code=404, detail="Club not found")

    membership = await session.get(ClubUser, (club.id, current_user.id))

    if not membership:
        raise HTTPException(status_code=403, detail="User is not a member of this club")
    if (
        membership.role not in [ClubRole.ADMIN, ClubRole.OWNER]
        or membership.status != ClubMemberStatus.ACTIVE
    ):
        raise HTTPException(
            status_code=403,
            detail="User does not have permission to create a movie night",
        )

    # Proceed to create the movie night
    new_movie_night = MovieNight(
        club_id=data.club_id,
        title=data.title,
        description=data.description,
        deadline=data.deadline,
    )

    session.add(new_movie_night)
    await session.commit()
    await session.refresh(new_movie_night)
    return new_movie_night


@router.get("/search")
async def search_movies(
    query: str,
    current_user: Annotated[User, Depends(get_current_user)],
):
    if not query.strip():
        return {"results": []}
    return await search_tmdb(query)


@router.get("/club/{club_id}")
async def get_movie_nights_for_club(
    club_id: int,
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> list[MovieNightRead]:
    club = await session.get(Club, club_id)
    if not club:
        raise HTTPException(status_code=404, detail="Club not found")
    membership = await session.get(ClubUser, (club.id, current_user.id))
    if not membership:
        raise HTTPException(status_code=403, detail="User is not a member of this club")
    if membership.status != ClubMemberStatus.ACTIVE:
        raise HTTPException(
            status_code=403, detail="User is not an active member of this club"
        )
    result = await session.execute(
        select(MovieNight).where(MovieNight.club_id == club_id)
    )
    movie_nights = result.scalars().all()
    return movie_nights


@router.post("/{movie_night_id}/movies")
async def add_movie_to_movie_night(
    movie_night_id: int,
    movie_id: int,
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    movie_night = await session.get(
        MovieNight,
        movie_night_id,
        options=[
            selectinload(MovieNight.movie_entries).selectinload(MovieNightMovie.movie)
        ],
    )
    if not movie_night:
        raise HTTPException(status_code=404, detail="Movie night not found")

    club = await session.get(Club, movie_night.club_id)
    membership = await session.get(ClubUser, (club.id, current_user.id))

    if not membership:
        raise HTTPException(status_code=403, detail="User is not a member of this club")
    if (
        membership.role not in [ClubRole.ADMIN, ClubRole.OWNER]
        or membership.status != ClubMemberStatus.ACTIVE
    ):
        raise HTTPException(
            status_code=403,
            detail="User does not have permission to add a movie to this movie night",
        )

    # First check if movie exists in the local database
    existing_movie = await session.get(Movie, movie_id)
    if not existing_movie:
        # If the movie does not exist in the local database, create it from TMDB ID
        existing_movie = await create_movie_from_tmdb_id(movie_id, session)

    if any(existing_movie == movie.movie for movie in movie_night.movie_entries):
        raise HTTPException(
            status_code=409, detail="Movie already added to this movie night"
        )

    # Add the movie to the movie night
    movie_night_movie = MovieNightMovie(
        movie_night_id=movie_night.id,
        movie_id=existing_movie.id,
        added_by_id=current_user.id,
    )
    session.add(movie_night_movie)

    movie_night.movie_entries.append(movie_night_movie)
    session.add(movie_night)
    await session.commit()
    await session.refresh(existing_movie)
    return existing_movie


@router.get("/{movie_night_id}/movies")
async def get_movies_for_movie_night(
    movie_night_id: int,
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
):

    movie_night = await session.get(
        MovieNight,
        movie_night_id,
        options=[
            selectinload(MovieNight.movie_entries).selectinload(MovieNightMovie.movie),
            selectinload(MovieNight.movie_entries)
            .selectinload(MovieNightMovie.votes)
            .selectinload(MovieNightVote.user),
        ],
    )
    if not movie_night:
        raise HTTPException(status_code=404, detail="Movie night not found")

    membership = await session.get(ClubUser, (movie_night.club_id, current_user.id))
    if not membership:
        raise HTTPException(status_code=403, detail="User is not a member of this club")
    if membership.status != ClubMemberStatus.ACTIVE:
        raise HTTPException(
            status_code=403, detail="User is not an active member of this club"
        )

    movies = [
        {
            **entry.movie.model_dump(),
            "votes": [
                MovieNightVoteRead(
                    user_id=vote.user_id,
                    image_url=vote.user.image_url,
                    username=vote.user.username,
                    created_at=vote.created_at,
                )
                for vote in entry.votes
            ],
        }
        for entry in movie_night.movie_entries
    ]
    return movies


@router.post("/{movie_night_id}/movies/{movie_id}/vote")
async def vote_for_movie_in_movie_night(
    movie_night_id: int,
    movie_id: int,
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    movie_night = await session.get(MovieNight, movie_night_id)
    if not movie_night:
        raise HTTPException(status_code=404, detail="Movie night not found")

    membership = await session.get(ClubUser, (movie_night.club_id, current_user.id))
    if not membership:
        raise HTTPException(status_code=403, detail="User is not a member of this club")
    if membership.status != ClubMemberStatus.ACTIVE:
        raise HTTPException(
            status_code=403, detail="User is not an active member of this club"
        )

    movie_entry = await session.execute(
        select(MovieNightMovie).where(
            MovieNightMovie.movie_night_id == movie_night_id,
            MovieNightMovie.movie_id == movie_id,
        )
    )
    movie_entry = movie_entry.scalar_one_or_none()
    if not movie_entry:
        raise HTTPException(
            status_code=404, detail="Movie not found in this movie night"
        )

    existing_vote = await session.get(
        MovieNightVote,
        (movie_entry.id, current_user.id),
    )
    if existing_vote:
        raise HTTPException(
            status_code=409, detail="User has already voted for this movie"
        )

    vote = MovieNightVote(
        movie_night_movie_id=movie_entry.id,
        user_id=current_user.id,
    )
    session.add(vote)
    await session.commit()
    await session.refresh(vote)
    return vote


@router.delete("/{movie_night_id}/movies/{movie_id}/vote")
async def remove_vote_for_movie_in_movie_night(
    movie_night_id: int,
    movie_id: int,
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    movie_night = await session.get(MovieNight, movie_night_id)
    if not movie_night:
        raise HTTPException(status_code=404, detail="Movie night not found")

    membership = await session.get(ClubUser, (movie_night.club_id, current_user.id))
    if not membership:
        raise HTTPException(status_code=403, detail="User is not a member of this club")
    if membership.status != ClubMemberStatus.ACTIVE:
        raise HTTPException(
            status_code=403, detail="User is not an active member of this club"
        )

    movie_entry = await session.execute(
        select(MovieNightMovie).where(
            MovieNightMovie.movie_night_id == movie_night_id,
            MovieNightMovie.movie_id == movie_id,
        )
    )
    movie_entry = movie_entry.scalar_one_or_none()
    if not movie_entry:
        raise HTTPException(
            status_code=404, detail="Movie not found in this movie night"
        )

    existing_vote = await session.get(
        MovieNightVote,
        (movie_entry.id, current_user.id),
    )
    if not existing_vote:
        raise HTTPException(status_code=404, detail="Vote not found")

    await session.delete(existing_vote)
    await session.commit()
    await session.refresh(movie_entry)
    return {"detail": "Vote removed successfully"}
