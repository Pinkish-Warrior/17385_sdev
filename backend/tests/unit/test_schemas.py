from datetime import datetime, timedelta, timezone

import pytest
from pydantic import ValidationError

from app.schemas import TaskCreate, TaskStatus, TaskUpdate


def future_date(days: int = 1) -> datetime:
    return datetime.now(timezone.utc) + timedelta(days=days)


class TestTaskCreate:
    def test_valid_minimal(self):
        task = TaskCreate(title="Review case file", due_date=future_date())
        assert task.title == "Review case file"
        assert task.status == TaskStatus.pending
        assert task.description is None

    def test_valid_full(self):
        task = TaskCreate(
            title="Review case file",
            description="Check all attachments",
            status=TaskStatus.in_progress,
            due_date=future_date(7),
        )
        assert task.description == "Check all attachments"
        assert task.status == TaskStatus.in_progress

    def test_title_required(self):
        with pytest.raises(ValidationError) as exc:
            TaskCreate(due_date=future_date())
        assert "title" in str(exc.value)

    def test_title_too_long(self):
        with pytest.raises(ValidationError):
            TaskCreate(title="x" * 201, due_date=future_date())

    def test_title_empty_string(self):
        with pytest.raises(ValidationError):
            TaskCreate(title="", due_date=future_date())

    def test_due_date_in_past_rejected(self):
        past = datetime.now(timezone.utc) - timedelta(days=1)
        with pytest.raises(ValidationError) as exc:
            TaskCreate(title="Task", due_date=past)
        assert "future" in str(exc.value)

    def test_due_date_no_timezone_rejected(self):
        naive = datetime.now() + timedelta(days=1)
        with pytest.raises(ValidationError) as exc:
            TaskCreate(title="Task", due_date=naive)
        assert "timezone" in str(exc.value)

    def test_invalid_status(self):
        with pytest.raises(ValidationError):
            TaskCreate(title="Task", status="invalid", due_date=future_date())


class TestTaskUpdate:
    def test_valid_status(self):
        update = TaskUpdate(status=TaskStatus.done)
        assert update.status == TaskStatus.done

    def test_invalid_status(self):
        with pytest.raises(ValidationError):
            TaskUpdate(status="unknown")

    def test_status_required(self):
        with pytest.raises(ValidationError):
            TaskUpdate()
