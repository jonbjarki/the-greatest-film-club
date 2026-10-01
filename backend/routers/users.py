from fastapi import APIRouter, Depends
from typing_extensions import Annotated

from auth import (
    get_current_active_user,
)
from models.user import User

router = APIRouter(tags=["users"], prefix="/users")


@router.get("/me")
async def read_users_me(
    current_user: Annotated[User, Depends(get_current_active_user)],
):
    return {"username": current_user.username}
