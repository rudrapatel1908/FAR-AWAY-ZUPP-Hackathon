# Architecture

Athena AI is structured as a monorepo with a FastAPI backend, a Next.js frontend, PostgreSQL for durable state, Redis for cache and queue-like coordination, and LangGraph for agent workflow orchestration.

## System Components

- `frontend/`: Next.js application for operators, analysts, and administrators.
- `backend/`: FastAPI API service that will expose platform capabilities and coordinate workflows.
- `PostgreSQL`: durable store for users, workspaces, decisions, workflow runs, audit trails, and configuration.
- `Redis`: cache, ephemeral coordination, rate-limiting support, and future queue primitives.
- `LangGraph`: agent workflow runtime for deterministic, inspectable decision processes.

## Backend Boundaries

The backend starts with three layers:

- API layer: FastAPI routers and HTTP-specific validation.
- Core layer: settings, logging, dependency wiring, and shared platform primitives.
- Workflow layer: future LangGraph graphs, state models, tools, and checkpointing.

Business logic should not live directly inside route handlers. Once the first domain capability is introduced, route handlers should delegate to application services or workflow entry points.

## Frontend Boundaries

The frontend uses the Next.js App Router with TypeScript and Tailwind CSS.

Expected boundaries:

- `src/app`: routes, layouts, and page composition.
- `src/components`: reusable UI components.
- `src/lib`: API clients, formatting helpers, and shared client utilities.

## Data Strategy

PostgreSQL is the source of truth for durable data. Redis should only hold data that can be recomputed, replayed, or recovered.

Future database work should include:

- Migration tooling.
- Explicit schema ownership.
- Audit-friendly decision records.
- Workflow run and checkpoint metadata.

## Agent Workflow Strategy

LangGraph will be used for autonomous decision workflows where traceability and deterministic state transitions matter.

Expected workflow principles:

- Typed graph state.
- Explicit nodes and edges.
- Human approval points where decisions carry operational risk.
- Durable checkpoints for long-running workflows.
- Full traceability from inputs to recommendation, action, or escalation.

## Deployment Direction

The current Docker Compose file only provisions PostgreSQL and Redis for local development. Application containers, CI, secrets management, observability, and deployment manifests should be added after the first runnable platform slice is defined.

