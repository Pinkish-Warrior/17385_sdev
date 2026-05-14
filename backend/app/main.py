from fastapi import FastAPI
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError

from app.exceptions import sqlalchemy_exception_handler
from app.routers import tasks

app = FastAPI(
    title="HMCTS Task Manager API",
    description="REST API for managing caseworker tasks",
    version="1.0.0",
)

app.add_exception_handler(SQLAlchemyError, sqlalchemy_exception_handler)
app.include_router(tasks.router)


@app.get("/health", tags=["health"])
def health():
    return JSONResponse(content={"status": "ok"})
