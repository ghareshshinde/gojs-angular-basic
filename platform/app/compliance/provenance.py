"""Provenance — PRD §8, control #3. C2PA on every output; watermark on free tier.

Phase 1 emits a C2PA-shaped manifest as a JSON sidecar and computes the visible
watermark label. Real signing binds the manifest to the media with a certificate
via the c2pa library; the manifest shape here is deliberately close to a C2PA
claim so that swap is mechanical.
"""
from __future__ import annotations

import hashlib
import json
from dataclasses import asdict, dataclass, field


@dataclass
class ProvenanceManifest:
    """A C2PA-shaped claim describing how the asset was produced."""

    job_id: str
    generator: str = "avatar-video-platform"
    ai_generated: bool = True
    models_used: list[str] = field(default_factory=list)
    asset_sha256: str = ""
    signed: bool = False

    def to_json(self) -> str:
        return json.dumps(asdict(self), indent=2, sort_keys=True)


def sign_c2pa(job_id: str, media_bytes: bytes, models_used: list[str]) -> ProvenanceManifest:
    """Produce a signed manifest for the given media.

    In Phase 1 the "signature" is a content hash; production replaces this with a
    real C2PA claim signature over the same fields. Every output goes through
    here — provenance is not optional.
    """
    digest = hashlib.sha256(media_bytes).hexdigest()
    return ProvenanceManifest(
        job_id=job_id,
        models_used=sorted(models_used),
        asset_sha256=digest,
        signed=True,
    )


def watermark_label(free_tier: bool) -> str | None:
    """Visible watermark text for free-tier output, else None (paid: C2PA only)."""
    return "AI-generated • avatar-video-platform" if free_tier else None
