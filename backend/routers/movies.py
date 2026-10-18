# from typing import Annotated

# from fastapi import APIRouter, Depends, Response
# from models.vote import Vote
# from sqlalchemy.orm import selectinload
# from sqlmodel import select
# from sqlmodel.ext.asyncio.session import AsyncSession

# from auth import get_current_active_user
# from config import Config
# from database import get_session
# from models.movie import Movie, MovieDetails, MovieError
# from models.user import User

# PAGE_SIZE = 12
# TMDB_BASE_URL = Config.TMDB_BASE_URL
# TMDB_API_KEY = Config.API_KEY

# router = APIRouter(prefix="/movies", tags=["movies"])


# @router.post("/{id}/vote", response_model=MovieDetails | MovieError)
# async def vote_movie(
#     id: int,
#     response: Response,
#     current_user: Annotated[User, Depends(get_current_active_user)],
#     session: Annotated[AsyncSession, Depends(get_session)],
# ) -> MovieDetails | MovieError:
#     movie = await session.get(Movie, id)
#     if not movie:
#         response.status_code = 404
#         return {"error": "Movie not found"}

#     existing_vote = await session.exec(
#         select(Vote).where(Vote.user_id == current_user.id, Vote.movie_id == id)
#     )

#     if existing_vote.first():
#         response.status_code = 409
#         return {"error": "User has already voted for this movie"}

#     new_vote = Vote(user_id=current_user.id, movie_id=id)
#     session.add(new_vote)
#     await session.commit()

#     statement = (
#         select(Movie)
#         .where(Movie.id == id)
#         .options(
#             selectinload(Movie.user),
#             selectinload(Movie.votes).selectinload(Vote.user),
#         )
#     )
#     movie = (await session.exec(statement)).first()

#     return {
#         **movie.model_dump(exclude={"votes"}),
#         "added_at": movie.added_at.isoformat(),
#         "added_by": movie.user.username,
#         "vote_count": len(movie.votes),
#         "user_voted": any(vote.user_id == current_user.id for vote in movie.votes),
#         "voted_users": [
#             {
#                 "id": vote.user.id,
#                 "username": vote.user.username,
#                 "image_url": vote.user.image_url,
#             }
#             for vote in movie.votes
#         ],
#     }


# @router.post("/{id}/unvote", response_model=MovieDetails | MovieError)
# async def unvote_movie(
#     id: int,
#     response: Response,
#     session: Annotated[AsyncSession, Depends(get_session)],
#     current_user: Annotated[User, Depends(get_current_active_user)],
# ) -> MovieDetails | MovieError:
#     movie = await session.get(Movie, id)
#     if not movie:
#         response.status_code = 404
#         return {"error": "Movie not found"}

#     existing_vote = (
#         await session.exec(
#             select(Vote).where(Vote.user_id == current_user.id, Vote.movie_id == id)
#         )
#     ).first()
#     if not existing_vote:
#         response.status_code = 404
#         return {"error": "Vote not found"}

#     await session.delete(existing_vote)
#     await session.commit()

#     statement = (
#         select(Movie)
#         .where(Movie.id == id)
#         .options(
#             selectinload(Movie.user),
#             selectinload(Movie.votes).selectinload(Vote.user),
#         )
#     )
#     movie = (await session.exec(statement)).first()

#     return {
#         **movie.model_dump(exclude={"votes"}),
#         "added_at": movie.added_at.isoformat(),
#         "added_by": movie.user.username,
#         "vote_count": len(movie.votes),
#         "user_voted": any(vote.user_id == current_user.id for vote in movie.votes),
#         "voted_users": [
#             {
#                 "id": vote.user.id,
#                 "username": vote.user.username,
#                 "image_url": vote.user.image_url,
#             }
#             for vote in movie.votes
#         ],
#     }
