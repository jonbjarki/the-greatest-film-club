import os
from dotenv import load_dotenv
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session, SQLModel, create_engine
from sqlalchemy.ext.asyncio import (
    create_async_engine,
)
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.orm import sessionmaker


async def create_db_and_tables():
    async with engine.begin() as conn:
        # Use run_sync to execute create_all on the connection
        await conn.run_sync(SQLModel.metadata.create_all)


async def get_session() -> AsyncSession:
    async with AsyncSession(engine) as session:
        yield session


load_dotenv()

sync_url = os.environ.get("DATABASE_URL")
engine = create_async_engine(sync_url, echo=True, future=True)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")
