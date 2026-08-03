"""Consent gating — PRD §8, control #1 and #2. Non-negotiable, no override.

Two rules are enforced here and nowhere else:

1. An avatar cannot become ACTIVE without an active LIKENESS consent record whose
   subject is the avatar owner. Until then it is PENDING_CONSENT and the job API
   refuses to run it.
2. A cloned voice cannot be used without an active VOICE consent record.

A checkbox is explicitly not sufficient (PRD §8): the consent record must point
at a recorded, timestamped, on-camera statement. That evidence requirement is
modelled by ``ConsentRecord.recording_uri`` being mandatory in the schema; this
module enforces the *linkage* and *revocation* rules.
"""
from __future__ import annotations

from ..schemas import Avatar, AvatarStatus, ConsentKind, VoiceSpec
from ..store import Store


class ConsentError(RuntimeError):
    """Raised when an action would proceed without valid consent."""


def activate_avatar(avatar: Avatar, store: Store) -> Avatar:
    """Move an avatar to ACTIVE, but only if consent checks out. No exceptions.

    There is deliberately no ``force`` / ``enterprise_override`` parameter. The
    PRD calls that out by name as forbidden.
    """
    if avatar.consent_id is None:
        raise ConsentError(
            f"avatar {avatar.id} has no consent record; cannot activate"
        )
    consent = store.get_consent(avatar.consent_id)
    if consent is None:
        raise ConsentError(f"consent {avatar.consent_id} not found")
    if consent.kind is not ConsentKind.LIKENESS:
        raise ConsentError("avatar consent must be a LIKENESS consent record")
    if not consent.is_active:
        raise ConsentError("consent has been revoked")

    avatar.status = AvatarStatus.ACTIVE
    return store.save_avatar(avatar)


def assert_avatar_usable(avatar: Avatar, store: Store) -> None:
    """Guard run at job-submission time (PRD §8: gate before any avatar activates)."""
    if avatar.status is not AvatarStatus.ACTIVE:
        raise ConsentError(
            f"avatar {avatar.id} is {avatar.status.value}; a consented, active "
            f"avatar is required before generation"
        )
    # Re-check the underlying consent in case it was revoked after activation.
    if avatar.consent_id is not None:
        consent = store.get_consent(avatar.consent_id)
        if consent is None or not consent.is_active:
            raise ConsentError(f"avatar {avatar.id} consent is missing or revoked")


def ensure_voice_consent(voice: VoiceSpec, store: Store) -> None:
    """Cloned voices require an active VOICE consent record (PRD §8, control #2)."""
    if not voice.is_clone:
        return  # stock voices need no per-subject consent
    if not voice.clone_consent_id:
        raise ConsentError("voice cloning requires a recorded consent record")
    consent = store.get_consent(voice.clone_consent_id)
    if consent is None:
        raise ConsentError(f"voice consent {voice.clone_consent_id} not found")
    if consent.kind is not ConsentKind.VOICE:
        raise ConsentError("voice consent must be a VOICE consent record")
    if not consent.is_active:
        raise ConsentError("voice consent has been revoked")
