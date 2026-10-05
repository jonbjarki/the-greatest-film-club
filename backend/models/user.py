import re
from datetime import datetime, timedelta, timezone
from typing import List, Optional
from typing import TYPE_CHECKING
import uuid
from pydantic import SecretStr, field_validator
from sqlmodel import Column, DateTime, Field, Relationship, SQLModel, func
from sqlalchemy import Index, column

if TYPE_CHECKING:
    from .movie import Movie
    from .vote import Vote

USERNAME_PATTERN = re.compile(r"^[a-z0-9]+(?:[._-][a-z0-9]+)*$", re.IGNORECASE)
RESERVED_USERNAMES = {
    "admin", "administrator", "root", "system", "support", "moderator",
    "api", "me", "null", "undefined", "login", "register", "settings",
}


def validate_username_format(value: str) -> str:
    value = value.strip()
    if not USERNAME_PATTERN.fullmatch(value):
        raise ValueError(
            "Username may only contain letters, numbers, and single '.', '_' or '-' "
            "separators, and must start and end with a letter or number."
        )
    if value.lower() in RESERVED_USERNAMES:
        raise ValueError("This username is reserved.")
    return value


class UserBase(SQLModel):
    username: str 
    image_url: str | None = None
    bio: Optional[str] = Field(default=None, min_length=20, max_length=300)

class UserRead(UserBase):
    id: uuid.UUID
    created_at: datetime

class UserUpdate(UserBase):
    username: Optional[str] = Field(default=None, min_length=4, max_length=20)
    image_url: str | None = None

    @field_validator("username")
    @classmethod
    def validate_username(cls, value: Optional[str]) -> Optional[str]:
        return None if value is None else validate_username_format(value)


class UserRegister(UserBase):
    password: SecretStr = Field(min_length=6, max_length=128)
    username: str = Field(min_length=4, max_length=20)
    
    @field_validator("password")
    @classmethod
    def validate_password_complexity(cls, value: SecretStr) -> SecretStr:
        """Enforces character complexity rules on the field."""
        # Retrieve the underlying string value securely
        raw_password = value.get_secret_value()
        
        if not any(char.isupper() for char in raw_password):
            raise ValueError("Password must contain at least one uppercase letter.")
        if not any(char.islower() for char in raw_password):
            raise ValueError("Password must contain at least one lowercase letter.")
        if not any(char.isdigit() for char in raw_password):
            raise ValueError("Password must contain at least one number.")
            
        return value
    
    @field_validator("username")
    @classmethod
    def validate_username(cls, value: str) -> str:
        return validate_username_format(value)
    

class User(SQLModel, table=True):
    __table_args__ = (Index("ix_user_username_lower", func.lower(column("username")), unique=True),)
    id: uuid.UUID | None = Field(default_factory=uuid.uuid7, primary_key=True)
    username: str = Field(index=True, unique=True)
    image_url: str | None = None
    bio: str | None = None
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column_kwargs={"server_default": func.now()},
        sa_type=DateTime(timezone=True),
    )
    hashed_password: str
    is_admin: bool = False
    added_movies: List["Movie"] = Relationship(back_populates="user")
    votes: List["Vote"] = Relationship(back_populates="user")
