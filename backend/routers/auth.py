from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import func, select

from auth import (
    ACCESS_TOKEN_EXPIRE_DAYS,
    authenticate_user,
    create_access_token,
    hash_password,
)
from database import get_session
from models.user import User, UserRead, UserRegister

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

    access_token = create_access_token(
        data={"sub": str(user.id), "name": user.username}
    )

    return {
        "user": {
            "username": user.username,
            "id": user.id,
        },
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_DAYS
        * 24
        * 60
        * 60,  # convert days to seconds
    }


@router.post("/register", response_model=UserRead)
async def register_user(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    session: Annotated[AsyncSession, Depends(get_session)],
):
    existing_user = await session.exec(
        select(User).where(func.lower(User.username) == form_data.username.lower())
    )
    if existing_user.first():
        raise HTTPException(status_code=400, detail="Username already registered")

    # Validate the user registration data using the UserRegister model
    try:
        data = UserRegister(
            username=form_data.username,
            password=form_data.password,
        )
        user = User(
            username=data.username,
            hashed_password=hash_password(data.password.get_secret_value()),
        )
        session.add(user)
        await session.commit()
        await session.refresh(user)
        return user
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail=e.errors()
        )


# @router.post("/refresh")
# async def refresh_token(
#     session: Annotated[AsyncSession, Depends(get_session)],
#     refresh_token: str,
# ):
#     # Decode the refresh token to extract its payload
#     payload = decode_refresh_token(refresh_token)
#     jti = payload["jti"]
#     user_id = str(payload["sub"])

#     if not jti or not user_id:
#         raise HTTPException(status_code=401, detail="Invalid refresh token")

#     refresh_session = await get_refresh_session(session, jti, user_id)
#     print(f"Decoded refresh token payload: {payload}")
#     print(f"Refresh session: {refresh_session}")
#     print("JTI:", jti)
#     print("User ID:", user_id)

#     # Check if the refresh session exists and is valid
#     if not refresh_session:
#         raise HTTPException(status_code=401, detail="Refresh token is invalid")
#     if refresh_session.expires_at < datetime.now(timezone.utc):
#         raise HTTPException(status_code=401, detail="Refresh token has expired")
#     if (
#         refresh_session.revoked_at
#         and datetime.now(timezone.utc) >= refresh_session.revoked_at
#     ):
#         raise HTTPException(status_code=401, detail="Refresh token has been revoked")
#     if (refresh_session.revoked_at
#         and datetime.now(timezone.utc) < refresh_session.revoked_at):
#         print("Refresh session has been revoked but is still within the grace period")
#         print("Revoked at:", refresh_session.revoked_at)
#         print("Current time:", datetime.now(timezone.utc))
#         # If the refresh session has been revoked but is still within the grace period, return the next set of tokens if available
#         if (
#             refresh_session.next_access_token
#             and refresh_session.next_refresh_token
#             and refresh_session.next_access_expires_at
#         ):
#             return {
#                 "access_token": refresh_session.next_access_token,
#                 "refresh_token": refresh_session.next_refresh_token,
#                 "expires_in": (
#                     refresh_session.next_access_expires_at - datetime.now(timezone.utc)
#                 ).total_seconds(),
#             }
#         else:
#             raise HTTPException(
#                 status_code=401, detail="Refresh token has been revoked"
#             )

#     # Generate new access and refresh tokens
#     new_jti = uuid7()
#     access_token = create_access_token(
#         data={"sub": user_id}
#         )
#     refresh_token, expires_at = create_refresh_token(
#             data={"sub": user_id, "jti": str(new_jti)}
#         )

#     # Revoke the current refresh session and start grace period
#     await revoke_refresh_session(
#         session, refresh_session, access_token, refresh_token, expires_at
#     )

#     # Save new session
#     await save_refresh_session(
#         session, payload["sub"], str(new_jti), expires_at=expires_at
#     )

#     return {
#         "access_token": access_token,
#         "refresh_token": refresh_token,
#         "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,  # convert minutes to seconds
#     }
