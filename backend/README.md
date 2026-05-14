# Backend — Python / FastAPI

REST API for the HMCTS Task Manager.

## Prerequisites

- Python 3.12+
- PostgreSQL

## Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

## Run

```bash
uvicorn app.main:app --reload --port 8000
```

## Migrate

```bash
alembic upgrade head
```

## Test

```bash
pytest --cov=app tests/
```

## API Docs

Swagger UI available at http://localhost:8000/docs once running.
