"""Refusal layer — PRD §8, control #4.

Two screens:

- ``screen_subject``: block known public-figure likenesses. Phase 1 uses a small
  denylist; production swaps in a face-embedding match against a public-figure
  index (pgvector) behind the same function signature.
- ``screen_script``: classifier screening for fraud / medical / electoral content.
  Phase 1 uses keyword heuristics as a placeholder for a real classifier; the
  return shape (allow + reasons) is what the classifier will produce.

These are intentionally conservative stand-ins. The point of landing them now is
that the *call sites* exist (avatar creation, job submission), so turning the
heuristics into real models is a swap, not a new integration.
"""
from __future__ import annotations

import re
from dataclasses import dataclass, field


class RefusalError(RuntimeError):
    """Raised when content is blocked by the refusal layer."""


# Placeholder denylist. Real impl: embedding match against a public-figure index.
_PUBLIC_FIGURE_DENYLIST = {
    "us president",
    "prime minister",
    "elon musk",
    "taylor swift",
}

# Placeholder categories → indicative terms. Real impl: a trained classifier.
_SCRIPT_RISK_TERMS: dict[str, tuple[str, ...]] = {
    "fraud": ("wire transfer", "bank login", "one-time password", "gift card code"),
    "medical": ("cure cancer", "stop taking your medication", "guaranteed diagnosis"),
    "electoral": ("do not vote", "polling stations are closed", "rigged election"),
}


@dataclass
class ScreenResult:
    allowed: bool
    reasons: list[str] = field(default_factory=list)


def screen_subject(name: str) -> ScreenResult:
    """Block obvious public-figure likenesses at avatar-creation time."""
    lowered = name.strip().lower()
    for banned in _PUBLIC_FIGURE_DENYLIST:
        if banned in lowered:
            return ScreenResult(False, [f"matches public-figure denylist: {banned!r}"])
    return ScreenResult(True)


def screen_script(script: str) -> ScreenResult:
    """Flag fraud/medical/electoral content in the script."""
    lowered = script.lower()
    reasons: list[str] = []
    for category, terms in _SCRIPT_RISK_TERMS.items():
        for term in terms:
            if re.search(rf"\b{re.escape(term)}\b", lowered):
                reasons.append(f"{category}: matched {term!r}")
    return ScreenResult(not reasons, reasons)
