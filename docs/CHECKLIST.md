# CHECKLIST.md — HMCTS Task Manager

## Repository Setup
- [x] Initialise monorepo structure (`backend/`, `frontend/`, `docs/`)
- [x] Create root `README.md` with Podman preference and rationale
- [x] Create `.gitignore`
- [x] Create `develop` branch
- [x] Document stack decision (`STACK.md`)
- [x] Document implementation plan (`PLANNING.md`)
- [x] Document workflows and diagrams (`WORKFLOW.md`)

---

## Backend — Python / FastAPI

### Project Setup
- [x] Scaffold FastAPI app (`app/main.py`, `app/config.py`, `app/database.py`)
- [x] Configure PostgreSQL + SQLAlchemy session
- [x] Set up `requirements.txt`
- [x] Set up `pytest.ini` and test directory structure
- [x] Create `.env.example`

### Data Layer
- [x] Define `Task` SQLAlchemy model (`app/models.py`)
- [x] Set up Alembic (`alembic.ini`, `alembic/env.py`)
- [x] Write initial migration — create `tasks` table

### Schemas
- [x] `TaskCreate` Pydantic schema with future date validation
- [x] `TaskUpdate` Pydantic schema (status only)
- [x] `TaskResponse` Pydantic schema with `from_attributes`

### CRUD Endpoints
- [x] `POST /tasks` — create a task
- [x] `GET /tasks` — retrieve all tasks
- [x] `GET /tasks/{id}` — retrieve task by ID
- [x] `PATCH /tasks/{id}` — update task status
- [x] `DELETE /tasks/{id}` — delete a task
- [x] `GET /health` — health check

### Validation & Error Handling
- [x] Global exception handler for unexpected DB errors (500)
- [x] 404 handler for missing tasks
- [x] Consistent error response shape

### Tests
- [x] Unit: `TaskCreate` schema — valid inputs
- [x] Unit: `TaskCreate` schema — invalid inputs (missing title, past due date, no timezone)
- [x] Unit: `TaskUpdate` schema — valid and invalid status values
- [x] Integration: `POST /tasks` — happy path
- [x] Integration: `POST /tasks` — validation error (422)
- [x] Integration: `GET /tasks` — returns list
- [x] Integration: `GET /tasks/{id}` — happy path
- [x] Integration: `GET /tasks/{id}` — not found (404)
- [x] Integration: `PATCH /tasks/{id}` — status update
- [x] Integration: `PATCH /tasks/{id}` — not found (404)
- [x] Integration: `DELETE /tasks/{id}` — happy path
- [x] Integration: `DELETE /tasks/{id}` — not found (404)

### Docs
- [x] Verify Swagger UI renders at `/docs`
- [x] Verify ReDoc renders at `/redoc`

---

## Frontend — TypeScript / Express

### Project Setup
- [ ] Scaffold Express + TypeScript app
- [ ] Configure Nunjucks templates
- [ ] Install and configure GOV.UK Frontend assets
- [ ] Set up `tsconfig.json`
- [ ] Set up Jest + Supertest
- [ ] Create `.env.example`

### Pages
- [ ] Task list page — `GET /`
- [ ] Create task form — `GET /tasks/new`
- [ ] Handle create — `POST /tasks`
- [ ] Task detail / edit page — `GET /tasks/:id`
- [ ] Handle status update — `POST /tasks/:id`
- [ ] Handle delete — `POST /tasks/:id/delete`

### Error Handling
- [ ] Inline field error display (GOV.UK error summary)
- [ ] Network / API error banner
- [ ] 404 page
- [ ] 500 page

### Tests
- [x] Compile gate: `tsc --noEmit`
- [x] Unit: route handlers (mock fetch to backend)
- [x] Smoke: task list page renders
- [x] Smoke: create form renders
- [x] Smoke: detail page renders

---

## Infrastructure

- [x] `docker-compose.yml` / `podman-compose.yml` — PostgreSQL + backend + frontend
- [x] Backend `Dockerfile`
- [x] Frontend `Dockerfile`

---

## Polish & Submission

- [x] Backend `README.md` — setup, run, test, env vars
- [x] Frontend `README.md` — setup, run, test, env vars
- [x] Root `README.md` final review
- [x] `.env.example` verified for both services
- [x] All tests passing
- [x] Swagger UI verified end-to-end
- [x] Manual UI walkthrough (create → view → update → delete)
- [ ] Push to GitHub — final merge to `main`
- [ ] Share repository link
