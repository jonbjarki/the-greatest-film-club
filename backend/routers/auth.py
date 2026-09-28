from datetime import datetime, timezone

from fastapi import APIRouter, Cookie, Response
from fastapi import Depends, HTTPException, status
from uuid import uuid7
from fastapi.security import OAuth2PasswordRequestForm
from requests import session
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing_extensions import Annotated

from models.user import User

from auth import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    REFRESH_TOKEN_EXPIRE_MINUTES,
    authenticate_user,
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
    get_current_active_user,
    revoke_refresh_session,
    get_refresh_session,
    hash_password,
    save_refresh_session,
)
from database import get_session

router = APIRouter(tags=["auth"], prefix="/auth")


@router.post("/login")
async def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    session: Annotated[AsyncSession, Depends(get_session)],
    response: Response,
):
    user = await authenticate_user(session, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    jti = uuid7()
    access_token = create_access_token(
        data={"sub": str(user.id), "name": user.username}
    )
    refresh_token, expires_at = create_refresh_token(
        data={"sub": str(user.id), "jti": str(jti)}
    )
    await save_refresh_session(session, user.id, str(jti), expires_at=expires_at)

    # Set the refresh token as a cookie
    response.set_cookie(
        key="refresh_cookie",
        value=refresh_token,
        httponly=True,
        max_age=REFRESH_TOKEN_EXPIRE_MINUTES * 60,
    )
    return {
        "user": {
            "username": user.username,
            "id": user.id,
        },
        "access_token": access_token,
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


@router.post("/refresh")
async def refresh_token(
    session: Annotated[AsyncSession, Depends(get_session)],
    refresh_cookie: Annotated[str, Cookie()],
    response: Response,
):
    # Decode the refresh token to extract its payload
    payload = decode_refresh_token(refresh_cookie)
    jti = payload["jti"]
    user_id = str(payload["sub"])

    if not jti or not user_id:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    refresh_session = await get_refresh_session(session, jti, user_id)

    # Check if the refresh session exists and is valid
    if not refresh_session:
        raise HTTPException(status_code=401, detail="Refresh token is invalid")
    if refresh_session.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Refresh token has expired")

    # Revoke the current refresh session
    await revoke_refresh_session(session, refresh_session)
    # Generate new access and refresh tokens
    new_jti = uuid7()
    access_token = create_access_token(data={"sub": payload["sub"]})
    refresh_token, expires_at = create_refresh_token(
        data={"sub": payload["sub"], "jti": str(new_jti)}
    )
    await save_refresh_session(
        session, payload["sub"], str(new_jti), expires_at=expires_at
    )

    response.set_cookie(
        "refresh_cookie",
        refresh_token,
        httponly=True,
        max_age=REFRESH_TOKEN_EXPIRE_MINUTES * 60,
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,  # convert minutes to seconds
        "refresh_expires_in": 60 * 60 * 24 * 7,  # 7 days in seconds
    }
