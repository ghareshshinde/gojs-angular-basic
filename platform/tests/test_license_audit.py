"""The license audit is a gate, not a footnote (PRD §4, §8)."""
import pytest

from app.models_registry import (
    UnshippableModelError,
    assert_shippable,
    get_model,
    shippable_models,
)
from app.models_registry.licenses import Role
from app.services.base import ModelService


class _Dummy(ModelService):
    role = "dummy"

    def run(self, **kwargs):  # pragma: no cover - not exercised
        return None


def test_named_traps_are_not_shippable():
    # Every trap the PRD names by name must be blocked.
    for trap in ("xtts_v2", "flux1_dev", "hunyuanvideo", "sdxl"):
        assert get_model(trap).shippable is False
        with pytest.raises(UnshippableModelError):
            assert_shippable(trap)


def test_core_models_are_shippable():
    for ok in ("latentsync", "musetalk", "f5_tts", "kokoro_82m", "wan22", "flux1_schnell"):
        assert assert_shippable(ok).key == ok


def test_live_service_refuses_unshippable_model():
    # A real (non-mock) service cannot even be constructed around a trap model.
    with pytest.raises(UnshippableModelError):
        _Dummy("xtts_v2", mock=False)
    # Mock backends ship nothing, so they are allowed.
    assert _Dummy("xtts_v2", mock=True).model_key == "xtts_v2"


def test_shippable_filter_by_role():
    tts = shippable_models(Role.TTS)
    keys = {m.key for m in tts}
    assert "kokoro_82m" in keys
    assert "xtts_v2" not in keys
