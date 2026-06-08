# Athena AI

Athena AI is an Autonomous Decision Intelligence Platform. This repository is a production-oriented monorepo scaffold for the backend, frontend, documentation, infrastructure, and developer automation.

Business logic has intentionally not been implemented yet.

## What Was Added

- Monorepo structure with `backend/`, `frontend/`, `docs/`, `infra/`, and `scripts/`.
- FastAPI backend scaffold with typed settings and health/readiness endpoints.
- Next.js + TypeScript + Tailwind CSS frontend scaffold.
- PostgreSQL and Redis local dependency stack through Docker Compose.
- Root `.env.example`, `.gitignore`, `AGENTS.md`, `docs/ARCHITECTURE.md`, and `docs/ROADMAP.md`.
- Initial backend test covering the health endpoint.

## How To Run It

Copy the example environment file:

```bash
cp .env.example .env
```

Start local infrastructure:

```bash
docker compose up -d
```

Run the backend:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
uvicorn app.main:app --reload
```

On Windows PowerShell, activate the virtual environment with:

```powershell
.\.venv\Scripts\Activate.ps1
```

Run the frontend:

```bash
cd frontend
npm install
npm run dev
```

Default local URLs:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- API docs: `http://localhost:8000/docs`

## API Endpoints / Commands Added

Backend endpoints:

- `GET /healthz`: process health check.
- `GET /readyz`: dependency readiness placeholder. It currently returns `ok` until database and Redis clients are wired.

Root commands:

- `docker compose up -d`: starts PostgreSQL and Redis.
- `docker compose down`: stops PostgreSQL and Redis.

Backend commands:

- `uvicorn app.main:app --reload`: starts the FastAPI development server.
- `pytest`: runs backend tests.
- `ruff check .`: runs backend linting.
- `mypy app`: runs backend type checking.

Frontend commands:

- `npm run dev`: starts the Next.js development server.
- `npm run build`: builds the frontend.
- `npm run lint`: runs Next.js linting.
- `npm run typecheck`: runs TypeScript type checking.

## Environment Variables Needed

See `.env.example` for the full list.

Required for local infrastructure:

- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_DB`
- `POSTGRES_HOST`
- `POSTGRES_PORT`
- `DATABASE_URL`
- `REDIS_HOST`
- `REDIS_PORT`
- `REDIS_URL`

Required for application runtime:

- `ATHENA_ENV`
- `ATHENA_LOG_LEVEL`
- `BACKEND_HOST`
- `BACKEND_PORT`
- `BACKEND_CORS_ORIGINS`
- `NEXT_PUBLIC_API_BASE_URL`

Reserved for future LangGraph and model-provider integration:

- `LANGGRAPH_CHECKPOINT_URI`
- `OPENAI_API_KEY`

## Testing Status

- Backend: a minimal `pytest` health-check test has been added but not executed in this scaffold step.
- Frontend: no tests have been added yet.
- Integration tests: not added yet because database, Redis, and LangGraph business workflows are not implemented.

## Next Recommended Step

Define the first decision workflow contract: inputs, outputs, audit trail requirements, persistence model, and LangGraph state shape. After that, add database migrations and a thin API route backed by tests.

