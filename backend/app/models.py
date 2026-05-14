import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Enum, String, Text
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base


class Task(Base):
    __tablename__ = "tasks"

    # UUID avoids sequential ID enumeration attacks and is safe to expose in URLs
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)

    # Enum name is required by PostgreSQL to create a reusable type in the schema
    status = Column(
        Enum("pending", "in_progress", "done", name="task_status"),
        nullable=False,
        default="pending",
    )

    # timezone=True stores as timestamptz — avoids ambiguity when comparing across timezones
    due_date = Column(DateTime(timezone=True), nullable=False)

    # lambdas are required here — a bare datetime.now() would be evaluated once at class
    # definition time and every row would share the same frozen timestamp
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
