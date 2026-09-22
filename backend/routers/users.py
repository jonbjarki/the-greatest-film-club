from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from sqlmodel import Session, select
from typing_extensions import Annotated

from auth import (
    create_access_token,
    authenticate_user,
    get_current_active_user,
    hash_password,
)
from database import get_session
from models.user import User

router = APIRouter(tags=["users"], prefix="/api/users")


class RegisterInputModel(BaseModel):
    username: str
    password: str


@router.get("/me")
async def read_users_me(
    current_user: Annotated[User, Depends(get_current_active_user)],
):
    return {"username": current_user.username}
