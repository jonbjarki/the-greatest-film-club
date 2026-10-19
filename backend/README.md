# TGFC Backend

The FastAPI backend for TGFC. For an overview of the whole project, see the [root README](../README.md).

## Requirements

- [uv](https://docs.astral.sh/uv/) (it installs Python 3.14 for you if needed)
- A running PostgreSQL database. Run `docker compose up -d` from the project root to start one locally.

## Environment variables

Create a `.env` file in this folder:

```env
DATABASE_URL=postgresql://postgres:Abc.123@localhost:5433/movies
TMDB_BASE_URL=https://api.themoviedb.org/3
API_KEY=
SECRET_KEY=
```

| Variable | Where to get it |
| -------- | --------------- |
| `DATABASE_URL` | The connection string for your PostgreSQL database. The value above matches the database in [compose.yaml](../compose.yaml). For a hosted database, copy the connection string from your provider's dashboard. |
| `TMDB_BASE_URL` | Always `https://api.themoviedb.org/3`. |
| `API_KEY` | Your TMDB **API Read Access Token**. Create a free account at [themoviedb.org](https://www.themoviedb.org/signup), then find the token under [Settings → API](https://www.themoviedb.org/settings/api). Use the long read access token, not the shorter API key. |
| `SECRET_KEY` | Any long random string. It is used to sign login tokens. Generate one with `uv run python -c "import secrets; print(secrets.token_hex(32))"`. |
| `VERCEL_ENV` | Optional. Vercel sets it automatically when deployed. Leave it unset locally. |

## Running

```bash
uv sync
uv run fastapi dev main.py
```

The API runs at [http://localhost:8000](http://localhost:8000), and interactive docs are at [http://localhost:8000/docs](http://localhost:8000/docs). Database migrations run automatically on startup.

## Migrations

After changing a model in `models/`, generate and apply a migration:

```bash
uv run alembic revision --autogenerate -m "describe your change"
uv run alembic upgrade head
```

## Linting

```bash
uv run ruff check .
```
