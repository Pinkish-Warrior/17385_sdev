from fastapi import FastAPI

from app.routers import tasks

app = FastAPI(
    title="HMCTS Task Manager API",
    description="REST API for managing caseworker tasks",
    version="1.0.0",
)

app.include_router(tasks.router)


@app.get("/health", tags=["health"])
def health():
    return {"status": "ok"}
