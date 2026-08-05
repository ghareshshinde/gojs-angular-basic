"""Lip-sync service (PRD §4.1) — the core of the avatar pipeline.

LatentSync is the primary backend; MuseTalk is the low-latency tier. Both are
shippable in the registry. The mock backend produces a deterministic output URI
and carries the resolved duration forward.

This stage is where ~90s of the ~$0.08/min compute budget (PRD §7) is spent, so
the interface exposes ``resolution`` to let callers trade cost for quality.
"""
from __future__ import annotations

from typing import Any

from .base import ModelService, ServiceResult


class MockLipsyncService(ModelService):
    role = "lipsync"

    def run(self, *, source_video_uri: str, audio_uri: str,
            resolution: int = 1080, **_: Any) -> ServiceResult:
        uri = f"mock://lipsync/{self.model_key}/{resolution}p.mp4"
        return ServiceResult(uri=uri, meta={
            "backend": "mock",
            "source_video_uri": source_video_uri,
            "audio_uri": audio_uri,
            "resolution": resolution,
        })


_BACKENDS = {"mock": lambda key: MockLipsyncService(key, mock=True)}


def build_lipsync_service(backend: str, model_key: str = "latentsync") -> ModelService:
    try:
        return _BACKENDS[backend](model_key)
    except KeyError as exc:
        raise ValueError(f"unknown lipsync backend {backend!r}") from exc
