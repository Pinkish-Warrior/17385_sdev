from fastapi import Request
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError


async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    # Surface DB errors as 500 without leaking internal details to the client
    return JSONResponse(
        status_code=500,
        content={"detail": "A database error occurred. Please try again later."},
    )
