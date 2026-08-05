from __future__ import annotations

from fastapi import APIRouter

from ..config import get_settings
from ..models_registry import shippable_models

router = APIRouter(tags=["health"])


@router.get("/health")
def health() -> dict:
    s = get_settings()
    return {
        "status": "ok",
        "environment": s.environment,
        "backends": {
            "tts": s.tts_backend,
            "lipsync": s.lipsync_backend,
            "script": s.script_backend,
        },
        "shippable_models": len(shippable_models()),
    }
