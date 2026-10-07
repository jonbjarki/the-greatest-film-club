from fastapi import FastAPI
from fastapi.concurrency import asynccontextmanager

from database import engine, run_migrations
from routers import *


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Running migrations...")
    await run_migrations()
    print("Migrations completed.")
    yield
    await engine.dispose()


app = FastAPI(lifespan=lifespan)
# app.include_router(movies.router)
app.include_router(users.router)
app.include_router(auth.router)
app.include_router(club.router)
app.include_router(movienights.router)


@app.get("/health")
def health():
    return {"status": "ok"}
