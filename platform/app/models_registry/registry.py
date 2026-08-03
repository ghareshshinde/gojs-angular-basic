"""Registry access + the shippability gate.

Nothing in the pipeline should reference a model by hard-coded string. It goes
through here, and ``assert_shippable`` is the choke point that stops a
non-commercial or territorially-restricted model from being wired into a
production pipeline by accident (PRD §4, §8).
"""
from __future__ import annotations

from typing import Optional

from .licenses import CATALOG, ModelEntry, Role


class UnshippableModelError(RuntimeError):
    """Raised when code tries to use a model the license audit marks non-shippable."""


def get_model(key: str) -> ModelEntry:
    try:
        return CATALOG[key]
    except KeyError as exc:
        raise KeyError(f"unknown model {key!r}; not in the license-audited catalog") from exc


def models_for_role(role: Role | str) -> list[ModelEntry]:
    role = Role(role)
    return [m for m in CATALOG.values() if m.role is role]


def shippable_models(role: Optional[Role | str] = None) -> list[ModelEntry]:
    entries = CATALOG.values() if role is None else models_for_role(role)
    return [m for m in entries if m.shippable]


def assert_shippable(key: str) -> ModelEntry:
    """Return the entry, or raise if it may not be shipped commercially."""
    entry = get_model(key)
    if not entry.shippable:
        raise UnshippableModelError(
            f"{entry.name} ({entry.license}) is not shippable: {entry.notes} "
            f"Wire in a shippable {entry.role.value} model instead: "
            f"{[m.key for m in shippable_models(entry.role)]}"
        )
    return entry
