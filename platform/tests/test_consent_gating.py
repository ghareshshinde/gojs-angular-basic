"""Consent gating is non-negotiable (PRD §8)."""
import pytest

from app.compliance.consent import (
    ConsentError,
    activate_avatar,
    assert_avatar_usable,
    ensure_voice_consent,
)
from app.schemas import (
    Avatar,
    AvatarStatus,
    ConsentKind,
    ConsentRecord,
    VoiceSpec,
    utcnow,
)
from app.store import InMemoryStore


def _store_with_avatar():
    store = InMemoryStore()
    avatar = store.add_avatar(Avatar(
        account_id="acct", display_name="Casey",
        source_video_uri="s3://src/casey.mp4",
    ))
    return store, avatar


def test_avatar_cannot_activate_without_consent():
    store, avatar = _store_with_avatar()
    with pytest.raises(ConsentError):
        activate_avatar(avatar, store)
    assert avatar.status is AvatarStatus.PENDING_CONSENT


def test_avatar_activates_with_likeness_consent():
    store, avatar = _store_with_avatar()
    consent = store.add_consent(ConsentRecord(
        subject_id="casey", kind=ConsentKind.LIKENESS,
        recording_uri="s3://consent/casey.mp4",
    ))
    avatar.consent_id = consent.id
    activate_avatar(avatar, store)
    assert avatar.status is AvatarStatus.ACTIVE


def test_wrong_consent_kind_rejected():
    store, avatar = _store_with_avatar()
    voice_consent = store.add_consent(ConsentRecord(
        subject_id="casey", kind=ConsentKind.VOICE,
        recording_uri="s3://consent/casey-voice.mp4",
    ))
    avatar.consent_id = voice_consent.id
    with pytest.raises(ConsentError):
        activate_avatar(avatar, store)


def test_revoked_consent_blocks_use():
    store, avatar = _store_with_avatar()
    consent = store.add_consent(ConsentRecord(
        subject_id="casey", kind=ConsentKind.LIKENESS,
        recording_uri="s3://consent/casey.mp4",
    ))
    avatar.consent_id = consent.id
    activate_avatar(avatar, store)
    # Revoke after activation — the job-time guard must catch it.
    consent.revoked_at = utcnow()
    store.add_consent(consent)
    with pytest.raises(ConsentError):
        assert_avatar_usable(avatar, store)


def test_voice_cloning_requires_consent():
    store = InMemoryStore()
    clone = VoiceSpec(clone_sample_uri="s3://voice/sample.wav")  # no consent id
    with pytest.raises(ConsentError):
        ensure_voice_consent(clone, store)

    # Stock voice needs no per-subject consent.
    ensure_voice_consent(VoiceSpec(stock_voice_id="narrator-1"), store)


def test_no_enterprise_override_parameter():
    # The PRD forbids an override path; assert the function signature has none.
    import inspect

    params = set(inspect.signature(activate_avatar).parameters)
    assert params == {"avatar", "store"}
    assert not (params & {"force", "override", "enterprise_override", "skip_consent"})
