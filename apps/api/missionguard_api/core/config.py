"""Application configuration via environment variables."""
from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # --- API ----------------------------------------------------------------
    APP_ENV: str = "development"
    SECRET_KEY: str = "change-me-in-production"

    DATABASE_URL: str = ""          # postgresql+asyncpg://... (optional, falls back to SQLite)

    # --- AI -----------------------------------------------------------------
    ANTHROPIC_API_KEY: str = ""
    AI_MODEL: str = "claude-sonnet-4-5"
    AI_TEMPERATURE: float = 0.0     # deterministic for ethical scoring

    # --- CORS ---------------------------------------------------------------
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000"]

    # --- Redis / Celery -----------------------------------------------------
    REDIS_URL: str = "redis://localhost:6379/0"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
