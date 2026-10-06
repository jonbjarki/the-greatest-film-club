from datetime import UTC, datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from database import get_session
from models.club import Club, ClubCreate, ClubMemberStatus, ClubRead, ClubUser
from models.user import User

router = APIRouter(tags=["clubs"], prefix="/clubs")


@router.post("/", response_model=ClubRead)
async def create_club(
    data: ClubCreate, session: Annotated[AsyncSession, Depends(get_session)]
):
    statement = await session.exec(select(Club).where(Club.name == data.name))
    existing = statement.first()
    if existing:
        raise HTTPException(
            status_code=409, detail="A club with this name already exists"
        )

    new_club = Club(
        name=data.name,
        description=data.description,
    )
    session.add(new_club)
    await session.commit()
    await session.refresh(new_club)
    return new_club


@router.post("/{club_id}/invite/{user_id}")
async def invite_to_club(
    club_id: int, user_id: str, session: Annotated[AsyncSession, Depends(get_session)]
):
    club = session.get(Club, club_id)
    user = session.get(User, user_id)

    if not club:
        raise HTTPException(status_code=404, detail="Club not found")
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    link = ClubUser(
        club=club,
        user=user,
        invited_at=datetime.now(UTC),
        status=ClubMemberStatus.INVITED,
    )

    session.add(link)
    await session.commit()
    session.refresh(link)
    return link
