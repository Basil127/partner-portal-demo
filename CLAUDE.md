# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A demo B2B partner portal for **hotel management**. Booking agents partnered with a hotel use a dashboard to view metrics, manage reservations/inventory/content, and interact with an AI assistant. (The README still describes an older "booking" demo; treat `AGENTS.md` and this file as the current source of truth.)

## Architecture: four cooperating apps + a shared package

This is an npm-workspaces monorepo. Each app is **self-contained and communicates only over HTTP API contracts** — never import source across app boundaries (frontend ↔ backend ↔ mock-api).

- **`app/frontend`** — Next.js 16 / React 19 (App Router), Tailwind v4. The dashboard UI, built on a TailAdmin base (`base-admin-dashboard/` is the unmodified template kept for reference). Calls the backend's REST API.
- **`app/backend`** — Fastify 5, ESM, **hexagonal architecture** (see below). The portal's own API. Persists chat history (SQLite/Postgres) and proxies hotel data to the mock-api. Hosts the AI chat + an MCP server.
- **`app/mock-api`** — Python 3.13 / FastAPI / SQLAlchemy / Alembic, managed with **uv**. Simulates an Opera PMS ("operaclone2"). The backend is its client; agents never call it directly. Has its own `AGENTS.md`.
- **`app/ai-chat`** — A **vendored clone of the Vercel `ai-chatbot` template** (its own nested git repo). Reference/scratch only; not part of the running app. The live chat is in `app/frontend` + `app/backend`.
- **`packages/shared`** (`@partner-portal/shared`) — central domain types/utilities consumed by backend (and re-exported API types).

### Type-safe contract flow (critical to understand)

Types flow across the stack via **two generated OpenAPI contracts**. Do not hand-edit generated code — it is overwritten on regeneration.

1. **mock-api → backend client.** `app/mock-api/generate_openapi_spec.py` writes `openapi/external/mock-opera.json`. The backend's `openapi-ts.config.ts` generates a typed fetch client into `app/backend/src/infrastructure/adapters/http/external-client/*` (the "external-client" — the backend's view of the Opera PMS).
2. **backend → frontend client.** The backend's Fastify routes are introspected by `src/scripts/generate-openapi.ts`, merged with manual overrides in `openapi/openapi-additional.yaml`, and written to `openapi/openapi.yaml`. The frontend generates a typed client into `app/frontend/src/lib/api-client/*`.

**Never edit** `app/frontend/src/lib/api-client/*` or `app/backend/src/infrastructure/adapters/http/external-client/*` — use the generated types/SDK functions instead.

After changing **backend routes/schemas**, regenerate from repo root:
```bash
npm run openapi:generate   # backend spec + backend client + frontend client
```
After changing **mock-api endpoints**, first regenerate `mock-opera.json` from the Python side (`cd app/mock-api && uv run python generate_openapi_spec.py`), then run `npm run openapi:generate`.

### Backend hexagonal layout

Code under `app/backend/src` is split into `domain/` (models + repository interfaces), `application/services/` (business logic / use cases), and `infrastructure/` (adapters, controllers, repository impls, config). Repositories are interfaces in `domain/` with implementations in `infrastructure/repositories/`; e.g. a `HotelContentRepositoryImpl` simply delegates to the generated external-client. Everything is wired in `infrastructure/service-container.ts` (`createServiceContainer`) and consumed by routes. Functionality is grouped into modules: `hotel-content`, `hotel-inventory`, `hotel-reservations`, `hotel-shop` (plus `booking`, `chat`).

### AI & MCP

- AI chat route: `infrastructure/adapters/ai/ai-routes.ts` (`POST /api/ai/chat`), using the Vercel **AI SDK** (`streamText`/`generateText`). The model comes from `providers.ts` via **OpenRouter** (`OPENROUTER_API_KEY`, `OPENROUTER_MODEL`). System prompt lives in `adapters/ai/system.md`.
- **Tool definitions are a single source of truth** in `adapters/tools/tool-definitions.ts` (`createToolDefinitions(...)`), consumed both by the AI chat route and the MCP server (`adapters/mcp/mcp-server.ts`, routes in `mcp-routes.ts`). When adding an agent capability, add it there so both surfaces stay in sync.

## Commands

Run from the repo root unless noted. Node >= 22, npm >= 10.

```bash
npm run dev              # frontend (3000) + backend (3001) + mock-api (8000) concurrently
npm run dev:backend      # tsx watch
npm run dev:frontend     # next dev
npm run dev:mock-api     # cd app/mock-api && uv run -m operaclone2

npm run build            # build all workspaces
npm test                 # backend Jest suite (no frontend tests run here)
npm run lint             # eslint across backend, frontend, shared
npm run lint:fix
npm run typecheck        # tsc --noEmit for backend, frontend, shared
npm run format           # prettier --write
npm run pre-commit       # lint + typecheck + format
```

The Postgres **database is expected to already be running** on the dev machine when using `npm run dev`. Full containerized stack: `docker-compose.local.yml` (local) / `docker-compose.yml` (prod, behind Caddy). Service images are `ohm-demo-{frontend,backend,mock-api}`.

### Tests

- Backend: Jest (`ts-jest`). Run all with `npm test`; a single file from the backend workspace: `npm test --workspace=app/backend -- path/to/file.test.ts` (or `-t "test name"`). `test:watch`, `test:coverage` also available. Tests load env from repo-root `test.env`.
- Frontend: Jest + Testing Library, run via `npm run test --workspace=app/frontend` (uses `test.env`). Playwright is configured but not wired into the default test script.

### mock-api (Python, in `app/mock-api/`)

Uses **uv**. Activate the venv with `.\.venv\Scripts\activate`. Lint/format with Ruff (`uv run ruff check --fix`, `uv run ruff format`) and type-check with `mypy operaclone2` — **apply Ruff before handing work back**. DB migrations use Alembic (latest, SQLAlchemy 2.x), stored in `operaclone2/db/migrations`. Keep domain logic in services, separate from web handlers. See `app/mock-api/AGENTS.md`.

## Conventions

- **ESM everywhere** in TS apps (`"type": "module"`). Relative imports use `.js` extensions (NodeNext resolution), even from `.ts` source.
- Validation/schemas via **Zod v4** on both backend and frontend.
- Prettier (`.prettierrc`) + ESLint v9 flat config (`eslint.config.mjs`) are authoritative for style; tabs are used for indentation.

## Key environment variables

Backend (`app/backend/.env.local` in dev; Docker injects in prod; `test.env` for tests): `PORT` (3001), `DB_TYPE` (`sqlite`|`postgres`) + `DB_*`, `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`, and `EXTERNAL_CLIENT_*` (base URL `http://localhost:8000` + channel/app-key headers for the mock-api). See `app/backend/src/infrastructure/config/config.ts`. Root `.env`/`.env.example` hold shared Docker/Caddy/frontend vars (`DOMAIN`, `NEXT_PUBLIC_API_URL`, `VERSION`).
