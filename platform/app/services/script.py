"""Script service (PRD §5).

Self-hosted LLM (Qwen / Llama via vLLM) — self-hosted "not because it's cheaper
but because the on-prem promise breaks if any part of the pipeline calls a hosted
API." The mock backend passes the script through unchanged (Phase 1 accepts a
paste/upload script directly); the interface is here so script generation /
cleanup / translation (Phase 2) slot in without a pipeline change.
"""
from __future__ import annotations

from typing import Any

from .base import ModelService, ServiceResult


class MockScriptService(ModelService):
    role = "script"

    def run(self, *, script: str, **_: Any) -> ServiceResult:
        cleaned = script.strip()
        return ServiceResult(uri="inline://script", meta={"text": cleaned})


_BACKENDS = {"mock": lambda key: MockScriptService(key, mock=True)}


def build_script_service(backend: str, model_key: str = "kokoro_82m") -> ModelService:
    # model_key is a placeholder; a real LLM key would be added to the catalog.
    try:
        return _BACKENDS[backend](model_key)
    except KeyError as exc:
        raise ValueError(f"unknown script backend {backend!r}") from exc
