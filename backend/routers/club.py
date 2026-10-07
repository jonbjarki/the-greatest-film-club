from datetime import UTC, datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from auth import get_current_user
from database import get_session
from models.club import Club, ClubCreate, ClubMemberStatus, ClubRead, ClubRole, ClubUser
from models.user import User

router = APIRouter(tags=["clubs"], prefix="/clubs")


@router.post("/", response_model=ClubRead)
async def create_club(
    data: ClubCreate,
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
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

    link = ClubUser(
        club=new_club,
        user=current_user,
        invited_at=None,
        status=ClubMemberStatus.ACTIVE,
        role=ClubRole.OWNER,
    )
    session.add(link)
    await session.commit()
    await session.refresh(link)

    return new_club


@router.post("/{club_id}/invite/{username}")
async def invite_to_club(
    club_id: int,
    username: str,
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
):
    club = session.get(Club, club_id)
    user = (
        await session.exec(select(User).where(User.username == username))
    ).one_or_none()

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


@router.post("/{id}/join")
async def join_club(
    id: int,
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    club = await session.get(Club, id)

    if not club:
        raise HTTPException(status_code=404, detail="Club not found")

    link = await session.get(ClubUser, (id, current_user.id))

    if not link:
        raise HTTPException(
            status_code=403, detail="You have not been invited to this club"
        )
    if link.status == ClubMemberStatus.ACTIVE:
        raise HTTPException(status_code=409, detail="You have already joined this club")

    link.status = ClubMemberStatus.ACTIVE
    session.add(link)
    await session.commit()
    await session.refresh(link)
    return link
