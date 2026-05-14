# STACK.md — Stack Decision & Rationale

## Chosen Stack: Python (FastAPI) + TypeScript (Express + Nunjucks)

---

## Options Considered

Three stacks were evaluated against the challenge requirements:

1. **Full TypeScript / JavaScript** — Node.js + Express for both backend and frontend
2. **Go + TypeScript** — Go (Gin/Echo) backend, TypeScript/Express frontend
3. **Python (FastAPI) + TypeScript** *(chosen)* — FastAPI backend, TypeScript/Express frontend

---

## Why Not Full TypeScript / JavaScript

| Criteria | Full TS/JS | Python + TypeScript |
|---|---|---|
| **Swagger docs** | Must wire up `swagger-jsdoc` manually, annotate every route with JSDoc comments | Automatic — FastAPI reads type hints and generates it |
| **Validation** | Needs `zod` or `express-validator` configured separately | Pydantic handles it as part of defining your schema — same model = docs + validation + serialisation |
| **Boilerplate** | More setup: middleware, schema definitions, docs config | Less: one Pydantic class does the work of three separate concerns |
| **Testing** | Jest is good, but async Express testing needs careful setup | `pytest` is cleaner and more expressive for API testing |
| **When to prefer it** | Tight deadline, want one language throughout, closest to HMCTS starter repos | When challenge requirements (docs, validation) should be solved elegantly with less code |

Full TypeScript is a safe, solid choice — but it makes you **manually build** what FastAPI gives you for free. For a technical assessment where reviewers read your code, less boilerplate means the important logic is more visible.

---

## Why Not Go + TypeScript

| Criteria | Go + TypeScript | Python + TypeScript |
|---|---|---|
| **Swagger docs** | Needs `swaggo` with comment annotations on every handler — significant extra work | Automatic from type hints |
| **Validation** | No built-in solution; needs `go-playground/validator` wired manually | Pydantic — built into FastAPI's request handling |
| **Speed to build** | Slowest of the three — Go is verbose, more ceremony around structs, error handling, DB setup | Fastest — FastAPI + SQLAlchemy get you to a working API quickly |
| **Performance** | Go is faster at runtime (compiled, concurrent) | Irrelevant at this scale — a task manager with a handful of rows will never be the bottleneck |
| **Impressiveness** | High — Go is less common, signals breadth | Strong — FastAPI is modern and well-regarded in the industry |
| **When to prefer it** | If Go is your strongest language, or the role specifically values Go | When delivery speed and correctness matter more than runtime performance |

Go would be the most impressive on paper — but it costs the most time and produces more lines of code to achieve the same result. The documentation requirement specifically penalises Go, since Swagger is not automatic.

---

## Why Python (FastAPI) + TypeScript Wins This Challenge

The spec lists four explicit technical requirements:

| Requirement | Full TS/JS | Go + TypeScript | **Python + TypeScript** |
|---|---|---|---|
| Unit tests | Manual setup | Built-in test runner | `pytest` — excellent |
| Store data in a database | Sequelize / Knex | `database/sql` + lib | SQLAlchemy + Alembic |
| **Validation and error handling** | Extra library needed | Extra library needed | **Pydantic — automatic** |
| **Document API endpoints** | Manual annotation | Manual annotation | **FastAPI — automatic** |

FastAPI is the only choice where **two of the four requirements are solved by the framework itself**, leaving more time to write clean business logic and tests — which is what a reviewer actually reads.

---

## Why the Two Languages Complement Each Other

Python and TypeScript are not redundant here — each does what it is best at:

- **Python (FastAPI)** handles the heavy lifting: database access, business logic, validation, and auto-generated API documentation.
- **TypeScript (Express + Nunjucks)** handles the presentation layer with compile-time type safety and native compatibility with the GOV.UK Frontend design system.
- The boundary between them is a clean JSON HTTP API — each side is independently runnable, testable, and deployable.
- A `Task` TypeScript interface mirrors the FastAPI `TaskResponse` Pydantic schema, meaning shape mismatches between the API and the UI are caught at compile time, not at runtime.

---

## Summary

| Decision | Choice | Key reason |
|---|---|---|
| Backend language | Python 3.12 | Validation and API docs come free with the framework |
| Backend framework | FastAPI | Pydantic + OpenAPI auto-generation; modern, well-regarded |
| ORM / migrations | SQLAlchemy + Alembic | Production-grade, pairs naturally with FastAPI |
| Database | PostgreSQL | Relational, structured task data, industry standard |
| Frontend language | TypeScript | Type safety catches API/UI shape mismatches at compile time |
| Frontend framework | Express + Nunjucks | Server-rendered; compatible with GOV.UK Frontend macros |
| Backend testing | pytest + httpx | Expressive, async-compatible, excellent coverage tooling |
| Frontend testing | Jest + Supertest | Standard TypeScript/Node testing stack |
