"""Post service (PRD §5 / §4.5): FFmpeg, Real-ESRGAN upscale, watermark, C2PA.

This is the final, mandatory stage. It always attaches provenance — a signed
C2PA-shaped manifest — and applies the visible watermark on the free tier.
Provenance is not a feature flag; it runs on every output (PRD §8).
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from ..compliance.provenance import ProvenanceManifest, sign_c2pa, watermark_label
from .base import ModelService, ServiceResult


@dataclass
class PostResult(ServiceResult):
    provenance: ProvenanceManifest | None = None
    watermark: str | None = None


class MockPostService(ModelService):
    role = "post"

    def run(self, *, job_id: str, video_uri: str, models_used: list[str],
            free_tier: bool = True, upscale: bool = True, **_: Any) -> PostResult:
        # A real impl would run FFmpeg + Real-ESRGAN and read the output bytes.
        # The mock signs over the URI bytes so provenance is exercised end to end.
        final_uri = f"mock://post/{job_id}/final.mp4"
        manifest = sign_c2pa(job_id, final_uri.encode(), models_used)
        return PostResult(
            uri=final_uri,
            provenance=manifest,
            watermark=watermark_label(free_tier),
            meta={"upscaled": upscale, "source": video_uri},
        )


_BACKENDS = {"mock": lambda key: MockPostService(key, mock=True)}


def build_post_service(backend: str, model_key: str = "real_esrgan") -> ModelService:
    try:
        return _BACKENDS[backend](model_key)
    except KeyError as exc:
        raise ValueError(f"unknown post backend {backend!r}") from exc
