from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from sqlmodel import Session, select
from typing_extensions import Annotated

from ..auth import (
    create_access_token,
    authenticate_user,
    get_current_active_user,
    hash_password,
)
from ..database import get_session
from ..models.user import User

router = APIRouter(tags=["users"], prefix="/users")


class RegisterInputModel(BaseModel):
    username: str
    password: str


@router.post("/register")
async def register_user(
    register_input: RegisterInputModel,
    session: Annotated[Session, Depends(get_session)],
):
    existing_user = session.exec(
        select(User).where(User.username == register_input.username)
    ).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    user = User(
        username=register_input.username,
        hashed_password=hash_password(register_input.password),
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return {"username": user.username}


@router.get("/me")
async def read_users_me(
    current_user: Annotated[User, Depends(get_current_active_user)],
):
    return {"username": current_user.username}
