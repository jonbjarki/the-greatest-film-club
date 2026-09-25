import os
from typing import Annotated, AsyncGenerator
from dotenv import load_dotenv
from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import SQLModel
from sqlalchemy.ext.asyncio import (
    create_async_engine,
    async_sessionmaker,
)
from sqlmodel.ext.asyncio.session import AsyncSession

from config import Config


async def create_db_and_tables():
    async with engine.begin() as conn:
        # Use run_sync to execute create_all on the connection
        await conn.run_sync(SQLModel.metadata.create_all)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async_session = async_sessionmaker(
        bind=engine, class_=AsyncSession, expire_on_commit=False
    )
    async with async_session() as session:
        yield session


load_dotenv()

sync_url = Config.DATABASE_URL
engine = create_async_engine(sync_url, echo=True, future=True)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")
