import uuid
from datetime import datetime
from enum import Enum
from typing import TYPE_CHECKING

from sqlmodel import DateTime, Field, Relationship, SQLModel

if TYPE_CHECKING:
    from models.user import User


class ClubRole(str, Enum):
    MEMBER = "member"
    ADMIN = "admin"
    OWNER = "owner"


class ClubMemberStatus(str, Enum):
    INVITED = "invited"
    ACTIVE = "active"


class ClubBase(SQLModel):
    name: str
    description: str | None = None


class ClubCreate(ClubBase):
    pass


class ClubRead(ClubBase):
    id: int
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
