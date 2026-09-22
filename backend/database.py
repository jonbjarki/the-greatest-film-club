import os
from dotenv import load_dotenv
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session, SQLModel, create_engine


def create_db_and_tables():
    # SQLModel.metadata.drop_all(engine)
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session


load_dotenv()

sync_url = os.environ.get("DATABASE_URL")
engine = create_engine(sync_url, echo=True)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")
