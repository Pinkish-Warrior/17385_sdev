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
- [ ] `POST /tasks` — create a task
- [ ] `GET /tasks` — retrieve all tasks
- [ ] `GET /tasks/{id}` — retrieve task by ID
- [ ] `PATCH /tasks/{id}` — update task status
- [ ] `DELETE /tasks/{id}` — delete a task
- [ ] `GET /health` — health check

### Validation & Error Handling
- [ ] Global exception handler for unexpected DB errors (500)
- [ ] 404 handler for missing tasks
- [ ] Consistent error response shape

### Tests
- [ ] Unit: `TaskCreate` schema — valid inputs
- [ ] Unit: `TaskCreate` schema — invalid inputs (missing title, past due date, no timezone)
- [ ] Unit: `TaskUpdate` schema — valid and invalid status values
- [ ] Integration: `POST /tasks` — happy path
- [ ] Integration: `POST /tasks` — validation error (422)
- [ ] Integration: `GET /tasks` — returns list
- [ ] Integration: `GET /tasks/{id}` — happy path
- [ ] Integration: `GET /tasks/{id}` — not found (404)
- [ ] Integration: `PATCH /tasks/{id}` — status update
- [ ] Integration: `PATCH /tasks/{id}` — not found (404)
- [ ] Integration: `DELETE /tasks/{id}` — happy path
- [ ] Integration: `DELETE /tasks/{id}` — not found (404)

### Docs
- [ ] Verify Swagger UI renders at `/docs`
- [ ] Verify ReDoc renders at `/redoc`

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
- [ ] Compile gate: `tsc --noEmit`
- [ ] Unit: route handlers (mock fetch to backend)
- [ ] Smoke: task list page renders
- [ ] Smoke: create form renders
- [ ] Smoke: detail page renders

---

## Infrastructure

- [ ] `docker-compose.yml` / `podman-compose.yml` — PostgreSQL + backend + frontend
- [ ] Backend `Dockerfile`
- [ ] Frontend `Dockerfile`

---

## Polish & Submission

- [ ] Backend `README.md` — setup, run, test, env vars
- [ ] Frontend `README.md` — setup, run, test, env vars
- [ ] Root `README.md` final review
- [ ] `.env.example` verified for both services
- [ ] All tests passing
- [ ] Swagger UI verified end-to-end
- [ ] Manual UI walkthrough (create → view → update → delete)
- [ ] Push to GitHub
- [ ] Share repository link
