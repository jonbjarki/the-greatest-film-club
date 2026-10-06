import uuid
from datetime import datetime
from enum import Enum

from sqlmodel import DateTime, Field, Relationship, SQLModel

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
    role: ClubRole = ClubRole.MEMBER

    status: ClubMemberStatus = ClubMemberStatus.INVITED
    invited_at: datetime | None = Field(
        default=None,
        sa_type=DateTime(timezone=True),
    )
    joined_at: datetime | None = Field(default=None, sa_type=DateTime(timezone=True))


class Club(ClubBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    members: list[User] = Relationship(back_populates="club", link_model=ClubUser)
