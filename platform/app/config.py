"""Runtime configuration.

Settings are read from the environment (see ``.env.example``). Defaults are
chosen so the app runs locally with mock model backends and an inline queue,
i.e. no GPU, Redis, or Postgres required for development and tests.
"""
from __future__ import annotations

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="APP_", env_file=".env", extra="ignore")

    environment: str = "development"

    # Queue. In dev the task runs inline (eager) so no worker/broker is needed.
    celery_broker_url: str = "redis://localhost:6379/0"
    celery_result_backend: str = "redis://localhost:6379/1"
    celery_task_always_eager: bool = True

    # Object store (S3/R2/MinIO). Only a bucket name is needed by the scaffold;
    # the mock post stage writes provenance sidecars, not real blobs.
    object_store_bucket: str = "avatar-video-dev"

    # Backend selection per model role. "mock" keeps the pipeline GPU-free.
    # Swap to "latentsync" / "f5_tts" / "kokoro" etc. once adapters are wired.
    tts_backend: str = "mock"
    lipsync_backend: str = "mock"
    script_backend: str = "mock"

    # Free tier gets a visible watermark (PRD §6, §8). Paid tiers still get C2PA.
    force_visible_watermark: bool = True

    # Output ceilings for Phase 1 (PRD §6): 1080p, up to 5 minutes.
    max_output_seconds: int = 300
    max_output_height: int = 1080


@lru_cache
def get_settings() -> Settings:
    return Settings()
