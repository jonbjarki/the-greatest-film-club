from fastapi import APIRouter, Depends, File, HTTPException
from sqlmodel import select
from typing_extensions import Annotated

from auth import (
    get_current_active_user,
)
from database import get_session
from models.user import User, UserRead, UserUpdate
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(tags=["users"], prefix="/users")

@router.patch("/me", response_model=UserRead)
async def update_profile(
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_active_user)],
    data: UserUpdate,
) -> UserRead:
    
    # Extract the provided fields from the update data
    # This will throw a validation error if any of the constraints are violated
    update_dict = data.model_dump(exclude_none=True)
    current_user.sqlmodel_update(update_dict)

    session.add(current_user)
    await session.commit()
    await session.refresh(current_user)

    return current_user

@router.get("/me", response_model=UserRead)
async def get_profile(
    current_user: Annotated[User, Depends(get_current_active_user)],
) -> UserRead:
    return current_user


@router.get("/{username}", response_model=UserRead)
async def get_user_by_username(
    username: str,
    _current_user: Annotated[User, Depends(get_current_active_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
):
    user = await session.execute(
        select(User).where(User.username == username)
    )
    user = user.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user