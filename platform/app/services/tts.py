"""TTS service (PRD §4.2).

Stock voices → Kokoro-82M. Cloning → F5-TTS / CosyVoice 2. XTTS-v2 is a
licensing trap and is non-shippable in the registry, so a real adapter for it
cannot even be constructed via ``ModelService``.

The mock backend synthesises a deterministic silent-audio placeholder whose
duration is estimated from the script, so the downstream lip-sync stage and the
duration ceiling (PRD §6) can be exercised without a GPU.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from .base import ModelService, ServiceResult

# ~150 words/minute is a reasonable spoken-narration estimate.
_WORDS_PER_SECOND = 150 / 60


@dataclass
class TTSResult(ServiceResult):
    duration_seconds: float = 0.0


def estimate_duration_seconds(script: str) -> float:
    words = len([w for w in script.split() if w])
    return round(words / _WORDS_PER_SECOND, 2)


class MockTTSService(ModelService):
    role = "tts"

    def run(self, *, script: str, language: str = "en",
            voice_id: str | None = None, **_: Any) -> TTSResult:
        duration = estimate_duration_seconds(script)
        uri = f"mock://tts/{language}/{voice_id or 'stock'}.wav"
        return TTSResult(uri=uri, duration_seconds=duration,
                         meta={"backend": "mock", "language": language})


# Real adapters (F5-TTS, Kokoro, CosyVoice 2) would live here, each subclassing
# ModelService and passing mock=False so the shippability gate applies.

_BACKENDS = {"mock": lambda key: MockTTSService(key, mock=True)}


def build_tts_service(backend: str, model_key: str = "kokoro_82m") -> ModelService:
    try:
        return _BACKENDS[backend](model_key)
    except KeyError as exc:
        raise ValueError(f"unknown tts backend {backend!r}") from exc
