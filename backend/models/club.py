import re
import uuid
from datetime import datetime
from enum import Enum
from typing import TYPE_CHECKING

from pydantic import field_validator
from sqlalchemy.orm import validates
from sqlmodel import DateTime, Field, Relationship, SQLModel

if TYPE_CHECKING:
    from models.user import User

CLUB_NAME_REGEX_STRING = r"^[a-zA-Z0-9 ]+$"
CLUB_NAME_PATH_REGEX_STRING = r"^[a-zA-Z0-9\-]+$"
CLUB_NAME_PATH_PATTERN = re.compile(CLUB_NAME_PATH_REGEX_STRING, re.IGNORECASE)
CLUB_NAME_PATTERN = re.compile(CLUB_NAME_REGEX_STRING, re.IGNORECASE)


def normalize_name(value: str) -> str:
    return value.replace(" ", "-").lower()


class ClubRole(str, Enum):
    MEMBER = "member"
    ADMIN = "admin"
    OWNER = "owner"


class ClubMemberStatus(str, Enum):
    INVITED = "invited"
    ACTIVE = "active"


class ClubBase(SQLModel):
    name: str = Field(min_length=4, max_length=50)
    description: str | None = Field(default=None, max_length=255)

    @field_validator("name")
    def name_must_be_valid(cls, value: str) -> str:
        if value.strip() == "":
            raise ValueError("Name must not be empty")

        if not CLUB_NAME_PATTERN.match(value):
            raise ValueError("Name must only contain letters, numbers, and spaces")
        return value


class ClubCreate(ClubBase):
    pass


class ClubRead(ClubBase):
    id: int
    normalized_name: str


class ClubReadWithMembers(ClubRead):
    members: list[ClubUser] = []


class ClubUser(SQLModel, table=True):
    club_id: int = Field(foreign_key="club.id", primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id", primary_key=True)
    role: ClubRole = Field(default=ClubRole.MEMBER)

    status: ClubMemberStatus = ClubMemberStatus.INVITED
    invited_at: datetime | None = Field(
        default=None,
        sa_type=DateTime(timezone=True),
    )
    joined_at: datetime | None = Field(default=None, sa_type=DateTime(timezone=True))

    club: Club = Relationship(back_populates="member_links")
    user: User = Relationship(back_populates="club_links")


class Club(ClubBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    member_links: list[ClubUser] = Relationship(back_populates="club")
    # Normalized version of the name for route paths
    normalized_name: str = Field(index=True)

    @validates("name")
    def normalize_and_set_name(self, key: str, value: str) -> str:
        """Automatically normalizes the clubs name whenever it is set."""
        if value:
            self.normalized_name = normalize_name(value)
        return value
