from datetime import datetime, timedelta, timezone
from typing import List, Optional
from typing import TYPE_CHECKING
import uuid
from pydantic import SecretStr, field_validator
from sqlmodel import Column, DateTime, Field, Relationship, SQLModel, func

if TYPE_CHECKING:
    from .movie import Movie
    from .vote import Vote

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
    

class User(SQLModel, table=True):
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
