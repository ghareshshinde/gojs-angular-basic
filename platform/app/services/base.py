"""The stable internal interface every model sits behind (PRD §5).

"Every model sits behind a stable internal interface so it can be swapped without
touching orchestration." That is this file. Concrete adapters (LatentSync,
F5-TTS, ...) subclass ``ModelService``; the pipeline only ever sees this shape.

Each service declares the registry ``model_key`` it is backed by, and the base
class refuses to construct a service around a non-shippable model — so the
license audit (§4/§8) is enforced at wiring time, not discovered in production.
"""
from __future__ import annotations

import abc
from dataclasses import dataclass, field
from typing import Any

from ..models_registry import assert_shippable


@dataclass
class ServiceResult:
    """Base result: a URI to the produced artifact plus arbitrary metadata."""

    uri: str
    meta: dict[str, Any] = field(default_factory=dict)


class ModelService(abc.ABC):
    """A single model role behind a stable call surface.

    ``model_key`` must exist in the license-audited catalog. Mock backends pass
    ``mock=True`` to opt out of the shippability assertion (they ship nothing).
    """

    role: str = "abstract"

    def __init__(self, model_key: str, *, mock: bool = False) -> None:
        self.model_key = model_key
        self.mock = mock
        if not mock:
            # Real backends must be license-clean before they can be constructed.
            assert_shippable(model_key)

    @abc.abstractmethod
    def run(self, **kwargs: Any) -> ServiceResult:
        """Execute the model. Adapters override with a role-specific signature."""

    def __repr__(self) -> str:  # pragma: no cover - trivial
        kind = "mock" if self.mock else "live"
        return f"<{type(self).__name__} role={self.role} model={self.model_key} {kind}>"
