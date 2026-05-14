# PLANNING.md — HMCTS Task Manager Technical Challenge

## Overview

Build a full-stack task management system for HMCTS caseworkers: a REST API backend and a browser frontend that together support creating, viewing, updating, and deleting tasks.

---

## Tech Stack

| Layer      | Choice                          | Rationale                                                              |
|------------|---------------------------------|------------------------------------------------------------------------|
| Backend    | Python 3.12 + FastAPI           | Auto-generates OpenAPI/Swagger docs; Pydantic handles validation free  |
| Database   | PostgreSQL                      | Relational, well-suited to structured task data                        |
| ORM        | SQLAlchemy + Alembic            | Mature ORM with migration support; pairs naturally with FastAPI        |
| Frontend   | TypeScript + Express + Nunjucks | Type-safe server-rendered client; GOV.UK Frontend compatible           |
| BE Testing | pytest + httpx                  | pytest is excellent; httpx provides async-compatible test client       |
| FE Testing | Jest + Supertest                | Standard TypeScript/Node testing stack                                 |
| API Docs   | Built into FastAPI (`/docs`)    | Zero extra config — Swagger UI and ReDoc served automatically          |

---

## Architecture

```
┌──────────────────────────┐       HTTP / JSON      ┌────────────────────────────┐
│   Frontend (port 3100)   │ ──────────────────────▶ │   Backend API (port 8000)  │
│  TypeScript + Express    │                          │  Python + FastAPI          │
│  + Nunjucks templates    │                          │  + SQLAlchemy              │
└──────────────────────────┘                          └────────────┬───────────────┘
                                                                   │
                                                                   ▼
                                                      ┌────────────────────────────┐
                                                      │       PostgreSQL DB         │
                                                      └────────────────────────────┘
```

- Frontend is a thin TypeScript/Express server that renders Nunjucks templates and calls the FastAPI backend.
- Backend owns all business logic, validation (Pydantic), and DB access (SQLAlchemy).
- Two separate repos — independently runnable, connected via environment variable.

---

## Data Model

### Task

| Field         | Type        | Constraints                                   |
|---------------|-------------|-----------------------------------------------|
| `id`          | UUID        | Primary key, auto-generated                   |
| `title`       | String      | Required, max 200 chars                       |
| `description` | Text        | Optional, nullable                            |
| `status`      | Enum        | `pending` \| `in_progress` \| `done`          |
| `due_date`    | DateTime    | Required, ISO 8601, must be in the future     |
| `created_at`  | DateTime    | Auto, set on insert                           |
| `updated_at`  | DateTime    | Auto, updated on change                       |

**Pydantic schemas** (FastAPI request/response models):
- `TaskCreate` — title, description?, status, due_date
- `TaskUpdate` — status only (PATCH)
- `TaskResponse` — all fields including id, created_at, updated_at

---

## API Endpoints

| Method   | Path          | Request Body    | Response        | Description           |
|----------|---------------|-----------------|------------------|-----------------------|
| `POST`   | `/tasks`      | `TaskCreate`    | `TaskResponse`   | Create a task         |
| `GET`    | `/tasks`      | —               | `TaskResponse[]` | Retrieve all tasks    |
| `GET`    | `/tasks/{id}` | —               | `TaskResponse`   | Retrieve task by ID   |
| `PATCH`  | `/tasks/{id}` | `TaskUpdate`    | `TaskResponse`   | Update task status    |
| `DELETE` | `/tasks/{id}` | —               | 204 No Content   | Delete a task         |
| `GET`    | `/health`     | —               | `{ status }`     | Health check          |
| `GET`    | `/docs`       | —               | Swagger UI       | Auto-generated docs   |
| `GET`    | `/redoc`      | —               | ReDoc UI         | Auto-generated docs   |

All error responses use a consistent shape:
```json
{ "detail": "message" }
```
or for validation errors (422):
```json
{ "detail": [{ "loc": [...], "msg": "...", "type": "..." }] }
```

---

## Frontend Pages

| Route                       | Description                                    |
|-----------------------------|------------------------------------------------|
| `GET /`                     | Task list — all tasks, status badges, due date |
| `GET /tasks/new`            | Create task form                               |
| `POST /tasks`               | Handle create, redirect on success             |
| `GET /tasks/:id`            | Task detail and edit form                      |
| `POST /tasks/:id`           | Handle status update, redirect on success      |
| `POST /tasks/:id/delete`    | Handle delete, redirect to list                |

Use **GOV.UK Frontend** for accessible, on-brand UI components (buttons, form inputs, error summaries, status tags).

---

## Validation & Error Handling

### Backend (FastAPI + Pydantic)
- Pydantic automatically validates request bodies and returns 422 with field-level detail on failure — no extra code needed.
- Return `404` with `{ "detail": "Task not found" }` for missing tasks.
- `due_date` validator: reject dates in the past.
- SQLAlchemy exceptions caught in a global exception handler; surface `500` only for truly unexpected DB errors.

### Frontend (TypeScript)
- Display field-level errors returned by the API in GOV.UK error summary and inline error components.
- Catch `fetch` failures (network down, non-2xx) and show a GOV.UK notification banner.
- TypeScript strict mode (`"strict": true`) catches shape mismatches at compile time.

---

## Testing Strategy

### Backend — pytest + httpx
- **Unit tests**: test Pydantic schemas (valid/invalid inputs), service functions in isolation (mock SQLAlchemy session).
- **Integration tests**: spin up a test PostgreSQL DB (or SQLite for speed), test all endpoints via `httpx.AsyncClient`.
- Cover: happy path, validation errors (400/422), not found (404), delete then re-fetch (404).
- Run with `pytest --cov` targeting ≥ 80% coverage.

### Frontend — Jest + Supertest
- Unit test route handlers (mock `fetch` to the backend).
- Smoke-test that key pages render without throwing (Supertest against the Express app).
- TypeScript compilation (`tsc --noEmit`) as a pre-test gate.

---

## Implementation Order

### Phase 1 — Backend
1. Scaffold FastAPI app: `main.py`, router, Pydantic schemas, SQLAlchemy models.
2. Set up Alembic migrations; create `tasks` table.
3. Implement all five CRUD endpoints.
4. Add `due_date` future-date validator in Pydantic.
5. Add global exception handler for DB errors.
6. Write unit and integration tests (pytest).
7. Verify `/docs` Swagger UI renders all endpoints correctly.

### Phase 2 — Frontend
8. Scaffold TypeScript + Express app; configure Nunjucks and GOV.UK Frontend assets.
9. Task list page — `GET /tasks` → render table with status badges.
10. Create form — `GET/POST /tasks/new` → validate and call `POST /tasks`.
11. Detail/edit page — `GET/POST /tasks/:id` → display task, update status.
12. Delete flow — `POST /tasks/:id/delete` → call `DELETE /tasks/:id`, redirect.
13. Inline error display for API validation failures.

### Phase 3 — Polish & submission
14. Write `README.md` for each repo (prerequisites, setup, run, test, env vars).
15. Add `.env.example` files.
16. Docker Compose file to run both services + PostgreSQL together.
17. Final pass: all tests green, Swagger UI correct, manual UI walkthrough.
18. Push both repos to GitHub, collect links.

---

## Repository Structure

### Backend — `hmcts-task-api` (Python)
```
app/
  main.py              # FastAPI app entry point, router registration
  database.py          # SQLAlchemy engine and session
  models.py            # SQLAlchemy ORM model
  schemas.py           # Pydantic request/response schemas
  routers/
    tasks.py           # CRUD route handlers
  dependencies.py      # DB session dependency
tests/
  unit/
    test_schemas.py
    test_service.py
  integration/
    test_tasks_api.py
alembic/               # DB migrations
  versions/
alembic.ini
requirements.txt
.env.example
README.md
```

### Frontend — `hmcts-task-frontend` (TypeScript)
```
src/
  app.ts               # Express app setup
  server.ts            # Entry point
  routes/
    index.ts           # Task list
    tasks.ts           # Create, detail, update, delete
  types/
    task.ts            # TypeScript interface matching TaskResponse
  views/               # Nunjucks templates
    layout.html
    tasks/
      list.html
      new.html
      detail.html
tests/
  routes.test.ts
public/                # GOV.UK Frontend compiled assets
tsconfig.json
package.json
.env.example
README.md
```

---

## Environment Variables

### Backend (`.env`)
```
DATABASE_URL=postgresql://user:pass@localhost:5432/tasks_db
PORT=8000
```

### Frontend (`.env`)
```
BACKEND_API_URL=http://localhost:8000
PORT=3100
NODE_ENV=development
```

### Docker Compose (optional but recommended)
Runs PostgreSQL, the FastAPI backend, and the TypeScript frontend together with one `docker compose up`.

---

## Key Risks & Mitigations

| Risk                                        | Mitigation                                                     |
|---------------------------------------------|----------------------------------------------------------------|
| Alembic migration conflicts locally         | Use Docker Compose to pin Postgres version; run migrations on startup |
| GOV.UK Frontend asset pipeline complexity   | Copy compiled assets from `node_modules/govuk-frontend/dist`  |
| FastAPI async vs sync SQLAlchemy            | Use `sqlalchemy` sync sessions with `run_in_threadpool` or switch to `asyncpg` + `databases` if needed |
| Time pressure on test coverage              | Write tests for each endpoint immediately after implementing it |
| Scope creep (auth, pagination, search)      | Deliver spec requirements first; note stretch goals in README  |
