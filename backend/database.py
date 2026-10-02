import asyncio
import os
from typing import Annotated, AsyncGenerator
import asyncpg
from dotenv import load_dotenv
from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import SQLModel
from sqlalchemy.ext.asyncio import (
    create_async_engine,
    async_sessionmaker,
)
from sqlmodel.ext.asyncio.session import AsyncSession
from alembic.config import Config as AlembicConfig
from alembic import command

from config import Config

async def run_migrations():
    alembic_cfg = AlembicConfig("alembic.ini")
    await asyncio.to_thread(command.upgrade, alembic_cfg, "head")

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
        
async def get_connection():
    return await asyncpg.connect(Config.DATABASE_URL, ssl="require" if Config.VERCEL_ENV in ["production", "preview"] else None)


engine = create_async_engine(
    Config.ASYNC_DATABASE_URL,
    async_creator=get_connection,
    echo=True,
    future=True,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")
