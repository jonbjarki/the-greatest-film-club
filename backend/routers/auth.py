from fastapi import APIRouter
from fastapi import Depends, HTTPException, status
from uuid import uuid7
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing_extensions import Annotated

from models.user import User

from auth import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    authenticate_user,
    create_access_token,
    create_refresh_token,
    hash_password,
)
from database import get_session

router = APIRouter(tags=["auth"], prefix="/auth")


@router.post("/login")
async def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    session: Annotated[AsyncSession, Depends(get_session)],
):
    user = await authenticate_user(session, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    jti = uuid7()
    access_token = create_access_token(data={"sub": user.username})
    refresh_token = create_refresh_token(data={"sub": user.username, "jti": str(jti)})
    return {
        "user": {
            "username": user.username,
            "id": user.id,
        },
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,  # convert minutes to seconds
        "refresh_expires_in": 60 * 60 * 24 * 7,  # 7 days in seconds
    }


@router.post("/register")
async def register_user(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    session: Annotated[AsyncSession, Depends(get_session)],
):
    existing_user = await session.exec(
        select(User).where(User.username == form_data.username)
    )

    if existing_user.first():
        raise HTTPException(status_code=400, detail="Username already registered")
    user = User(
        username=form_data.username,
        hashed_password=hash_password(form_data.password),
    )
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return {"username": user.username}
