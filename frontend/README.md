# Frontend — TypeScript / Express

Server-rendered frontend for the HMCTS Task Manager. Built with Express, Nunjucks, and GOV.UK Frontend. Calls the FastAPI backend over HTTP.

---

## Prerequisites

- Node.js 20+
- The backend API running (see `backend/README.md`)

---

## Setup

```bash
cd frontend
npm install
cp .env.example .env
```

Edit `.env`:

```
BACKEND_API_URL=http://localhost:8000
PORT=3100
NODE_ENV=development
```

---

## Start the dev server

```bash
npm run dev
```

Frontend runs at `http://localhost:3100`

Hot-reloads on file changes via `ts-node-dev`.

---

## Build for production

```bash
npm run build
npm start
```

---

## Run tests

```bash
npm test
```

Runs 13 Jest + Supertest tests with coverage report.

---

## Pages

| Route | Description |
|---|---|
| `GET /` | Redirects to `/tasks` |
| `GET /tasks` | Task list with status badges |
| `GET /tasks/new` | Create task form |
| `POST /tasks` | Handle create, redirect on success |
| `GET /tasks/:id` | Task detail and status update form |
| `POST /tasks/:id` | Handle status update |
| `POST /tasks/:id/delete` | Delete task, redirect to list |

---

## Project structure

```
src/
  app.ts              # Express app, Nunjucks config, routes
  server.ts           # Entry point — starts HTTP server
  routes/
    tasks.ts          # All task route handlers
  middleware/
    errors.ts         # 404 and 500 error handlers
  types/
    task.ts           # TypeScript interfaces matching backend schemas
  views/
    layout.html       # Base GOV.UK Frontend template
    tasks/
      list.html       # Task list page
      new.html        # Create task form
      detail.html     # Task detail and edit page
    errors/
      404.html
      500.html
tests/
  app.test.ts         # Route handler tests (Jest + Supertest)
```

---

## Environment variables

| Variable | Description | Example |
|---|---|---|
| `BACKEND_API_URL` | URL of the FastAPI backend | `http://localhost:8000` |
| `PORT` | Port the frontend listens on | `3100` |
| `NODE_ENV` | Environment mode | `development` / `production` |
