from datetime import datetime, timezone
from enum import Enum
from uuid import UUID

from pydantic import BaseModel, Field, field_validator


class TaskStatus(str, Enum):
    pending = "pending"
    in_progress = "in_progress"
    done = "done"


class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1)
    status: TaskStatus = TaskStatus.pending
    due_date: datetime

    @field_validator("due_date")
    @classmethod
    def due_date_must_be_future(cls, v: datetime) -> datetime:
        # Normalise to UTC for comparison regardless of what timezone the client sends
        now = datetime.now(timezone.utc)
        if v.tzinfo is None:
            raise ValueError("due_date must include timezone information")
        if v <= now:
            raise ValueError("due_date must be in the future")
        return v


class TaskUpdate(BaseModel):
    # PATCH only allows status changes per the spec
    status: TaskStatus


class TaskResponse(BaseModel):
    id: UUID
    title: str
    description: str | None
    status: TaskStatus
    due_date: datetime
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}  # allows mapping from SQLAlchemy model instances
