from fastapi import APIRouter
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select
from typing_extensions import Annotated

from ..models.user import User
from ..routers.users import RegisterInputModel

from ..auth import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    authenticate_user,
    create_access_token,
    hash_password,
)
from ..database import get_session

router = APIRouter(tags=["auth"], prefix="/auth")


@router.post("/login")
async def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    session: Annotated[Session, Depends(get_session)],
):
    user = authenticate_user(session, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user.username})
    return {
        "user": {
            "username": user.username,
            "id": user.id,
        },
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,  # convert minutes to seconds
    }


@router.post("/register")
async def register_user(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    session: Annotated[Session, Depends(get_session)],
):
    existing_user = session.exec(
        select(User).where(User.username == form_data.username)
    ).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    user = User(
        username=form_data.username,
        hashed_password=hash_password(form_data.password),
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return {"username": user.username}
