"""MissionGuard AI – FastAPI application entry point."""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from missionguard_api.core.config import settings
from missionguard_api.core.database import Base, engine
from missionguard_api.routers import gifts, health, policies
import missionguard_api.models  # noqa: F401 – ensure models are registered


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables (SQLite dev) – Alembic handles production Postgres
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    # Shutdown


app = FastAPI(
    title="MissionGuard AI API",
    description=(
        "AI-powered ethical decision-support platform for nonprofits. "
        "Operationalises the Modified Acceptance (Pilot Phase) framework."
    ),
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, tags=["health"])
app.include_router(gifts.router, prefix="/api/v1/gifts", tags=["gifts"])
app.include_router(policies.router, prefix="/api/v1/policies", tags=["policies"])
