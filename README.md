# The Greatest Film Club (TGFC)

A web app for running a film club. Members create clubs, invite friends, plan movie nights, nominate films and vote on what to watch before the voting deadline.

## Features

- **Accounts:** register, log in and edit your profile, including uploading an avatar.
- **Clubs:** create a club, invite users by username, accept invites and leave clubs.
- **Roles:** each club has owners, admins and members. Owners and admins can change member roles and remove members.
- **Movie nights:** schedule a movie night with a voting deadline.
- **Nominations and voting:** search [TMDB](https://www.themoviedb.org/) for films, add them to a movie night and vote for the ones you want to watch.

## Screenshots

| Clubs List | Club Home Page |
| --------- | ------------------ |
|  ![Clubs List](docs/screenshots/clubs-list.png) | ![Club home page](docs/screenshots/club-home.png) |

| View Movie Night | View/Vote Movie |
| -------------- | ------- |
| ![Movie Night Overview](docs/screenshots/movie-night-view.png) | ![View Movie](docs/screenshots/movie-night-vote.png) |

## Tech stack

| Part     | Technologies |
| -------- | ------------ |
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/ui, Auth.js (NextAuth v5), Zod |
| Backend  | FastAPI, SQLModel / SQLAlchemy (async), Alembic, Python 3.14 |
| Database | PostgreSQL |
| External | TMDB API (movie data), Vercel Blob (avatar storage) |
| Hosting  | Vercel Services (frontend and backend in one project) |

## Project structure

```
.
├── backend/            FastAPI app
│   ├── main.py         App entrypoint; runs migrations on startup
│   ├── config.py       Settings loaded from .env
│   ├── routers/        API routes (auth, users, clubs, movie-nights)
│   ├── models/         SQLModel tables and schemas
│   ├── dal/            TMDB data access
│   ├── alembic/        Database migrations
│   └── postman/        Postman collection for the API
├── frontend/           Next.js app
│   ├── auth.ts         Auth.js config (credentials login against the backend)
│   └── src/
│       ├── app/        Routes and server actions
│       ├── components/ UI components
│       ├── schemas/    Zod schemas for API data
│       └── lib/        Shared helpers
├── compose.yaml        Local PostgreSQL database
└── vercel.json         Vercel Services deployment config
```

## Getting started

### Prerequisites

- [Docker](https://www.docker.com/), for the local database
- [uv](https://docs.astral.sh/uv/) and Python 3.14
- Node.js and [pnpm](https://pnpm.io/)
- A [TMDB API read access token](https://developer.themoviedb.org/docs/getting-started)

### 1. Start the database

From the project root:

```bash
docker compose up -d
```

This starts PostgreSQL on `localhost:5433` with a database called `movies`.

### 2. Run the backend

Create `backend/.env`:

```env
DATABASE_URL=postgresql://postgres:Abc.123@localhost:5433/movies
TMDB_BASE_URL=https://api.themoviedb.org/3
API_KEY=<your TMDB API read access token>
SECRET_KEY=<a long random string used to sign JWTs>
```

Then install dependencies and start the dev server:

```bash
cd backend
uv sync
uv run fastapi dev main.py
```

The API runs at [http://localhost:8000](http://localhost:8000), and interactive docs are at [http://localhost:8000/docs](http://localhost:8000/docs). Migrations run automatically when the server starts.

### 3. Run the frontend

Create `frontend/.env`:

```env
API_URL=http://localhost:8000
AUTH_SECRET=<generate with: npx auth secret>
BLOB_READ_WRITE_TOKEN=<Vercel Blob token, only needed for avatar uploads>
```

Then install dependencies and start the dev server:

```bash
cd frontend
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and register an account to get started.

## Database migrations

The backend uses Alembic. After changing a model in `backend/models/`, generate and apply a migration:

```bash
cd backend
uv run alembic revision --autogenerate -m "describe your change"
uv run alembic upgrade head
```

## Deployment

The app is deployed to Vercel as a single project using [Vercel Services](vercel.json):

- Requests to `/backend/*` are routed to the FastAPI service.
- Everything else is routed to the Next.js frontend.
- The frontend reaches the backend through `BACKEND_INTERNAL_URL`, which Vercel injects automatically. Locally, `API_URL` is used instead.

Set the same environment variables as above in the Vercel project. In production and preview environments the backend connects to the database over SSL.

## API testing

A Postman collection covering the main endpoints is in [backend/postman/](backend/postman/).
