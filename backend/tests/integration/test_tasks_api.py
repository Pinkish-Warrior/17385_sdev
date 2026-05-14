from datetime import datetime, timedelta, timezone
from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import sessionmaker

from app.database import Base, get_db
from app.main import app

# SQLite in-memory DB for tests — avoids needing a running PostgreSQL instance
SQLALCHEMY_TEST_URL = "sqlite:///./test.db"

engine = create_engine(SQLALCHEMY_TEST_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client():
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


def future_date(days: int = 1) -> str:
    dt = datetime.now(timezone.utc) + timedelta(days=days)
    return dt.isoformat()


def create_task_payload(**kwargs) -> dict:
    return {"title": "Test task", "description": "Test description", "due_date": future_date(), **kwargs}


class TestCreateTask:
    def test_creates_task(self, client):
        response = client.post("/tasks", json=create_task_payload())
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "Test task"
        assert data["status"] == "pending"
        assert "id" in data

    def test_creates_task_with_description(self, client):
        response = client.post("/tasks", json=create_task_payload(description="Details here"))
        assert response.status_code == 201
        assert response.json()["description"] == "Details here"

    def test_missing_title_returns_422(self, client):
        response = client.post("/tasks", json={"due_date": future_date()})
        assert response.status_code == 422

    def test_past_due_date_returns_422(self, client):
        past = (datetime.now(timezone.utc) - timedelta(days=1)).isoformat()
        response = client.post("/tasks", json={"title": "Task", "due_date": past})
        assert response.status_code == 422


class TestGetAllTasks:
    def test_returns_empty_list(self, client):
        response = client.get("/tasks")
        assert response.status_code == 200
        assert response.json() == []

    def test_returns_created_tasks(self, client):
        client.post("/tasks", json=create_task_payload(title="Task A"))
        client.post("/tasks", json=create_task_payload(title="Task B"))
        response = client.get("/tasks")
        assert response.status_code == 200
        assert len(response.json()) == 2


class TestGetTask:
    def test_returns_task_by_id(self, client):
        created = client.post("/tasks", json=create_task_payload()).json()
        response = client.get(f"/tasks/{created['id']}")
        assert response.status_code == 200
        assert response.json()["id"] == created["id"]

    def test_returns_404_for_missing_task(self, client):
        response = client.get("/tasks/00000000-0000-0000-0000-000000000000")
        assert response.status_code == 404
        assert response.json()["detail"] == "Task not found"


class TestUpdateTask:
    def test_updates_status(self, client):
        created = client.post("/tasks", json=create_task_payload()).json()
        response = client.patch(f"/tasks/{created['id']}", json={"status": "done"})
        assert response.status_code == 200
        assert response.json()["status"] == "done"

    def test_returns_404_for_missing_task(self, client):
        response = client.patch(
            "/tasks/00000000-0000-0000-0000-000000000000", json={"status": "done"}
        )
        assert response.status_code == 404

    def test_invalid_status_returns_422(self, client):
        created = client.post("/tasks", json=create_task_payload()).json()
        response = client.patch(f"/tasks/{created['id']}", json={"status": "invalid"})
        assert response.status_code == 422


class TestDeleteTask:
    def test_deletes_task(self, client):
        created = client.post("/tasks", json=create_task_payload()).json()
        response = client.delete(f"/tasks/{created['id']}")
        assert response.status_code == 204

    def test_deleted_task_returns_404(self, client):
        created = client.post("/tasks", json=create_task_payload()).json()
        client.delete(f"/tasks/{created['id']}")
        response = client.get(f"/tasks/{created['id']}")
        assert response.status_code == 404

    def test_returns_404_for_missing_task(self, client):
        response = client.delete("/tasks/00000000-0000-0000-0000-000000000000")
        assert response.status_code == 404


class TestHealth:
    def test_health_check(self, client):
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json() == {"status": "ok"}


class TestExceptionHandler:
    def test_sqlalchemy_error_returns_500(self, client):
        def broken_db():
            raise SQLAlchemyError("simulated DB failure")

        app.dependency_overrides[get_db] = broken_db
        response = client.get("/tasks")
        app.dependency_overrides[get_db] = override_get_db
        assert response.status_code == 500
        assert "database error" in response.json()["detail"].lower()
