"""End-to-end core loop over mock backends (PRD §5, §6)."""
import pytest

from app.compliance.refusal import RefusalError
from app.config import Settings
from app.pipeline import run_pipeline
from app.schemas import (
    Avatar,
    AvatarStatus,
    ConsentKind,
    ConsentRecord,
    Job,
    JobRequest,
    VoiceSpec,
)
from app.store import InMemoryStore


def _active_avatar(store):
    consent = store.add_consent(ConsentRecord(
        subject_id="casey", kind=ConsentKind.LIKENESS,
        recording_uri="s3://consent/casey.mp4",
    ))
    return store.add_avatar(Avatar(
        account_id="acct", display_name="Casey",
        source_video_uri="s3://src/casey.mp4",
        status=AvatarStatus.ACTIVE, consent_id=consent.id,
    ))


def _job(avatar, script="Welcome to the onboarding course."):
    return Job(request=JobRequest(
        account_id="acct", avatar_id=avatar.id, script=script,
        voice=VoiceSpec(stock_voice_id="narrator-1"),
    ))


def test_core_loop_succeeds_and_attaches_provenance():
    store = InMemoryStore()
    avatar = _active_avatar(store)
    job = _job(avatar)
    artifacts = run_pipeline(job, avatar, store)
    assert artifacts.audio_uri.startswith("mock://tts/")
    assert artifacts.video_uri.startswith("mock://post/")
    assert artifacts.provenance_uri is not None  # C2PA on every output
    assert artifacts.duration_seconds > 0


def test_pending_avatar_is_rejected():
    store = InMemoryStore()
    avatar = _active_avatar(store)
    avatar.status = AvatarStatus.PENDING_CONSENT
    from app.compliance.consent import ConsentError

    with pytest.raises(ConsentError):
        run_pipeline(_job(avatar), avatar, store)


def test_refusal_layer_blocks_fraud_script():
    store = InMemoryStore()
    avatar = _active_avatar(store)
    job = _job(avatar, script="Please send a wire transfer to claim your prize.")
    with pytest.raises(RefusalError):
        run_pipeline(job, avatar, store)


def test_duration_ceiling_enforced():
    store = InMemoryStore()
    avatar = _active_avatar(store)
    # ~150 wpm → a 3-word script is trivially short; set the ceiling below it.
    job = _job(avatar, script="one two three four five six")
    from app.pipeline import PipelineError

    tiny = Settings(max_output_seconds=1)
    with pytest.raises(PipelineError):
        run_pipeline(job, avatar, store, settings=tiny)
