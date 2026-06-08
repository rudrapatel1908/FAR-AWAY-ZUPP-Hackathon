import time

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db_session

router = APIRouter(tags=["health"])


class HealthResponse(BaseModel):
    status: str
    service: str


class DbHealthResponse(BaseModel):
    status: str
    service: str
    database: str
    latency_ms: float


@router.get("/healthz", response_model=HealthResponse)
async def healthz() -> HealthResponse:
    return HealthResponse(status="ok", service="athena-ai-backend")


@router.get("/readyz", response_model=HealthResponse)
async def readyz() -> HealthResponse:
    return HealthResponse(status="ok", service="athena-ai-backend")


@router.get("/health/db", response_model=DbHealthResponse)
async def health_db(session: AsyncSession = Depends(get_db_session)) -> DbHealthResponse:  # noqa: B008
    started = time.perf_counter()
    await session.execute(text("SELECT 1"))
    latency_ms = round((time.perf_counter() - started) * 1000, 2)

    return DbHealthResponse(
        status="ok",
        service="athena-ai-backend",
        database="connected",
        latency_ms=latency_ms,
    )
