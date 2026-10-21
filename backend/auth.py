import hashlib
import secrets
import uuid
from datetime import UTC, datetime, timedelta
from typing import Annotated

from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerificationError
from fastapi import Depends, HTTPException, status
from sqlalchemy import delete
from sqlmodel import func, select
from sqlmodel.ext.asyncio.session import AsyncSession

from database import get_session, oauth2_scheme
from models.tokens import UserSession
from models.user import User

SESSION_LIFETIME = timedelta(days=30)

password_hasher = PasswordHasher()
# Verified against when the username doesn't exist, so a failed login takes
# the same time whether or not the account exists
DUMMY_PASSWORD_HASH = password_hasher.hash("dummy-password")


def hash_password(password: str) -> str:
    """Hash a password using argon2"""
    return password_hasher.hash(password)


def verify_password(plain_password: str, hashed: str) -> bool:
    """Verify a password against an argon2 hash"""
    try:
        return password_hasher.verify(hashed, plain_password)
    except VerificationError, InvalidHashError:
        return False


def hash_session_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


async def get_user(session: AsyncSession, id: str) -> User | None:
    result = await session.exec(select(User).where(User.id == id))
    return result.first()


async def get_user_by_username(session: AsyncSession, username: str) -> User | None:
    result = await session.exec(
        select(User).where(func.lower(User.username) == username.lower())
    )
    return result.first()


async def authenticate_user(
    session: AsyncSession, username: str, password: str
) -> User | None:
    user = await get_user_by_username(session, username)
    if not user:
        verify_password(password, DUMMY_PASSWORD_HASH)
        return None
    if not verify_password(password, user.hashed_password):
        return None

    return user


async def create_user_session(
    session: AsyncSession, user: User
) -> tuple[str, datetime]:
    """Starts a session for the user and returns its token and expiry time."""
    # Clear out the user's expired sessions so they don't pile up
    await session.execute(
        delete(UserSession).where(
            UserSession.user_id == user.id,
            UserSession.expires_at <= datetime.now(UTC),
        )
    )

    token = secrets.token_urlsafe(32)
    user_session = UserSession(
        user_id=user.id,
        token_hash=hash_session_token(token),
        expires_at=datetime.now(UTC) + SESSION_LIFETIME,
    )
    session.add(user_session)
    await session.commit()
    return token, user_session.expires_at


async def revoke_user_sessions(
    session: AsyncSession, user_id: uuid.UUID, except_id: uuid.UUID | None = None
) -> None:
    """Deletes every session of the user, optionally keeping one."""
    statement = delete(UserSession).where(UserSession.user_id == user_id)
    if except_id is not None:
        statement = statement.where(UserSession.id != except_id)
    await session.execute(statement)
    await session.commit()


async def get_current_auth(
    token: Annotated[str, Depends(oauth2_scheme)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> tuple[UserSession, User]:
    result = await session.exec(
        select(UserSession, User)
        .join(User, User.id == UserSession.user_id)
        .where(
            UserSession.token_hash == hash_session_token(token),
            UserSession.expires_at > datetime.now(UTC),
        )
    )
    row = result.first()
    if row is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return row


async def get_current_session(
    auth: Annotated[tuple[UserSession, User], Depends(get_current_auth)],
) -> UserSession:
    return auth[0]


async def get_current_user(
    auth: Annotated[tuple[UserSession, User], Depends(get_current_auth)],
) -> User:
    return auth[1]
