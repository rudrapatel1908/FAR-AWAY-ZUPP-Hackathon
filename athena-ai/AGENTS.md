# AGENTS.md

Coding rules for AI agents working in the Athena AI monorepo.

## Operating Principles

- Keep changes scoped to the requested task.
- Do not implement business logic until a product requirement, API contract, and test strategy exist.
- Prefer explicit, typed interfaces over implicit dictionaries or loosely shaped data.
- Preserve existing user changes. Never revert files you did not intentionally edit.
- Update documentation when commands, configuration, environment variables, or public behavior changes.

## Repository Layout

- `backend/`: FastAPI service, API routing, infrastructure adapters, and agent orchestration entry points.
- `frontend/`: Next.js application written in TypeScript and styled with Tailwind CSS.
- `docs/`: Architecture, roadmap, decisions, and operational notes.
- `infra/`: Infrastructure-as-code and deployment assets.
- `scripts/`: Repeatable developer and CI helper scripts.

## Backend Rules

- Use FastAPI with Pydantic models for request and response validation.
- Keep routers thin. Put reusable application behavior in service modules once business logic is introduced.
- Keep LangGraph workflow definitions isolated from HTTP routing.
- Read configuration from environment variables through a typed settings module.
- Add tests for every new route, workflow edge, persistence adapter, and failure path.
- Do not hard-code credentials, model names, URLs, or tenant-specific assumptions.

## Frontend Rules

- Use Next.js App Router, TypeScript, and Tailwind CSS.
- Keep server/client component boundaries explicit.
- Use accessible controls, semantic HTML, and predictable keyboard behavior.
- Keep API access in `src/lib` or dedicated data modules.
- Avoid adding UI libraries unless the dependency is justified and documented.

## Data and Infrastructure Rules

- PostgreSQL is the source of truth for durable application data.
- Redis is used for cache, lightweight coordination, and queue-like primitives where appropriate.
- Migrations must be deterministic and reviewable when database schema is introduced.
- Docker Compose is for local dependencies only unless explicitly extended.

## Quality Gates

- Backend: run linting, type checks, and tests before handoff once those commands exist.
- Frontend: run linting, type checks, and tests before handoff once those commands exist.
- Documentation: keep README, architecture, and roadmap aligned with code changes.

