# HMCTS Task Manager

A full-stack task management system for HMCTS caseworkers, built as part of the DTS Developer Technical Test.

---

## What This Is

A monorepo containing both the backend API and frontend application for managing caseworker tasks — creating, viewing, updating, and deleting them.

---

## Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Backend    | Python 3.12 + FastAPI             |
| Database   | PostgreSQL + SQLAlchemy + Alembic |
| Frontend   | TypeScript + Express + Nunjucks   |
| UI         | GOV.UK Frontend                   |
| Testing    | pytest + httpx (BE), Jest + Supertest (FE) |
| Docs       | Auto-generated Swagger UI at `/docs` |

---

## Repo Structure

```
hmcts-task-manager/
├── backend/               # Python / FastAPI REST API
├── frontend/              # TypeScript / Express frontend
├── docker-compose.yml     # Runs both services + PostgreSQL
├── PLANNING.md            # Implementation strategy
├── STACK.md               # Stack decision and rationale
├── WORKFLOW.md            # Architecture and flow diagrams
└── README.md
```

---

## Why a Monorepo

This project uses a single repository with `backend/` and `frontend/` as separate sub-directories rather than two separate repos. Reasons:

- **Single source of truth** — one clone gets you everything; no submodule ceremony
- **One `docker-compose.yml`** — `docker compose up` starts the API, frontend, and database together
- **Shared context** — planning docs, workflow diagrams, and stack decisions live at the root alongside the code
- **Simpler CI** — one pipeline can lint, test, and build both services in parallel
- **Easier review** — a reviewer sees the full system in one place without switching repos

The backend and frontend remain independently runnable — each has its own `README.md`, dependency file, and test suite. The monorepo is a delivery convenience, not a coupling.

---

## Quick Start

### Prerequisites

- Docker and Docker Compose
- (Optional for local dev) Python 3.12+ and Node.js 20+

### Run with Docker

```bash
docker compose up
```

| Service  | URL                          |
|----------|------------------------------|
| Frontend | http://localhost:3100         |
| API      | http://localhost:8000         |
| Swagger  | http://localhost:8000/docs    |

### Run locally

See [`backend/README.md`](./backend/README.md) and [`frontend/README.md`](./frontend/README.md) for individual setup instructions.

---

## Branch Strategy

```
main        ← always deployable, merged via PR only
develop     ← integration branch, all features merge here first
feature/*   ← one branch per piece of work
```

### Commit Convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/):

| Prefix       | When to use                              |
|--------------|------------------------------------------|
| `feat:`      | New feature                              |
| `fix:`       | Bug fix                                  |
| `chore:`     | Setup, config, dependencies              |
| `test:`      | Adding or updating tests                 |
| `docs:`      | README, comments, planning documents     |
| `refactor:`  | Code restructure without behaviour change |

---

## Documentation

| Document | Description |
|---|---|
| [`PLANNING.md`](./PLANNING.md) | Full implementation plan, phases, and repo structure |
| [`STACK.md`](./STACK.md) | Stack decision rationale and comparison against alternatives |
| [`WORKFLOW.md`](./WORKFLOW.md) | Mermaid diagrams — architecture, API flow, user journey, testing |

---

## API Endpoints

| Method   | Path              | Description            |
|----------|-------------------|------------------------|
| `POST`   | `/tasks`          | Create a task          |
| `GET`    | `/tasks`          | Retrieve all tasks     |
| `GET`    | `/tasks/{id}`     | Retrieve task by ID    |
| `PATCH`  | `/tasks/{id}`     | Update task status     |
| `DELETE` | `/tasks/{id}`     | Delete a task          |
| `GET`    | `/health`         | Health check           |
| `GET`    | `/docs`           | Swagger UI             |
