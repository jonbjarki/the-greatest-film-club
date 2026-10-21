from typing import Annotated

from fastapi import APIRouter, Depends, Form, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import func, select

from auth import (
    authenticate_user,
    create_user_session,
    get_current_session,
    hash_password,
)
from database import get_session
from models.tokens import UserSession
from models.user import User, UserPrivateRead, UserRegister

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

    access_token, expires_at = await create_user_session(session, user)

    return {
        "user": {
            "username": user.username,
            "id": user.id,
        },
        "access_token": access_token,
        "token_type": "bearer",
        "expires_at": expires_at,
    }


@router.post("/logout", status_code=204)
async def logout(
    current_session: Annotated[UserSession, Depends(get_current_session)],
    session: Annotated[AsyncSession, Depends(get_session)],
):
    await session.delete(current_session)
    await session.commit()


@router.post("/register", response_model=UserPrivateRead)
async def register_user(
    form_data: Annotated[UserRegister, Form()],
    session: Annotated[AsyncSession, Depends(get_session)],
):
    existing_user = await session.exec(
        select(User).where(func.lower(User.username) == form_data.username.lower())
    )
    if existing_user.first():
        raise HTTPException(status_code=400, detail="Username already registered")

    existing_email = await session.exec(
        select(User).where(func.lower(User.email) == form_data.email.lower())
    )
    if existing_email.first():
        raise HTTPException(status_code=400, detail="Email already registered")

    # Validate the user registration data using the UserRegister model
    try:
        user = User(
            username=form_data.username,
            email=form_data.email,
            image_url=form_data.image_url,
            bio=form_data.bio,
            hashed_password=hash_password(form_data.password.get_secret_value()),
        )
        session.add(user)
        await session.commit()
    except IntegrityError:
        # Another registration claimed the username or email after the checks above
        await session.rollback()
        raise HTTPException(
            status_code=400, detail="Username or email already registered"
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail=str(e)
        )
    await session.refresh(user)
    return user
