from typing_extensions import Annotated
from fastapi import Depends

from fastapi import FastAPI
from fastapi.concurrency import asynccontextmanager
from sqlmodel import SQLModel, Session
import requests
import os
from database import engine, oauth2_scheme, create_db_and_tables
from routers import movies, users, auth

from models.movie import Movie


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield
    engine.dispose()


app = FastAPI(lifespan=lifespan)
app.include_router(movies.router)
app.include_router(users.router)
app.include_router(auth.router)


@app.get("/backend/health")
def health1():
    return {"status": "ok1"}


@app.get("/health")
def health2():
    return {"status": "ok2"}


@app.get("/api/health")
def health3():
    return {"status": "ok3"}
