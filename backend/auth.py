import os
from datetime import datetime, timedelta, timezone

from fastapi import Depends, HTTPException, status
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlmodel import select
from typing_extensions import Annotated
from sqlmodel.ext.asyncio.session import AsyncSession
from config import Config
from database import get_session, oauth2_scheme
from models.tokens import RefreshSession
from models.user import User

SECRET_KEY = Config.SECRET_KEY
REFRESH_SECRET_KEY = Config.REFRESH_SECRET_KEY
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 0.5  # 30 seconds for testing purposes
REFRESH_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

import bcrypt


def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain_password: str, hashed: str) -> bool:
    """Verify a password against its hash"""
    return bcrypt.checkpw(
        plain_password.encode("utf-8"),
        hashed.encode("utf-8"),
    )


async def get_user(session: AsyncSession, id: str) -> User | None:
    result = await session.exec(select(User).where(User.id == id))
    return result.first()


async def get_user_by_username(session: AsyncSession, username: str) -> User | None:
    result = await session.exec(select(User).where(User.username == username))
    return result.first()


async def authenticate_user(
    session: AsyncSession, username: str, password: str
) -> User | None:
    user = await get_user_by_username(session, username)
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def create_refresh_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(days=7))
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, REFRESH_SECRET_KEY, algorithm=ALGORITHM), expire


async def save_refresh_session(
    session: AsyncSession, user_id: str, jti: str, expires_at: datetime
):
    token_session = RefreshSession(user_id=user_id, jti=jti, expires_at=expires_at)
    session.add(token_session)
    await session.commit()


async def get_refresh_session(
    session: AsyncSession, jti: str, user_id: str
) -> RefreshSession | None:
    result = await session.exec(
        select(RefreshSession).where(
            RefreshSession.jti == jti, RefreshSession.user_id == user_id
        )
    )
    return result.first()


async def revoke_refresh_session(
    session: AsyncSession, refresh_session: RefreshSession
):
    await session.delete(refresh_session)
    await session.commit()


def decode_refresh_token(token: str):
    try:
        payload = jwt.decode(
            token,
            REFRESH_SECRET_KEY,
            algorithms=[ALGORITHM],
        )

        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")

        jti = payload.get("jti")

        if not jti:
            raise HTTPException(status_code=401, detail="Missing jti")

        return payload

    except JWTError as e:
        print(f"Failed to decode refresh token: {token}", e)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        print(f"Decoding token: {token}")
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        id = payload.get("sub")
        if id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = await get_user(session, id)
    if user is None:
        raise credentials_exception
    return user


async def get_current_active_user(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    return current_user
