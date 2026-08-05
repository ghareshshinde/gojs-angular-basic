"""Orchestration DAG for the Phase 1 core loop (PRD §5).

    script → tts → lipsync → post(upscale + watermark + C2PA)

The orchestrator is deliberately thin: it resolves each stage's service from the
registry/config, runs them in order, and threads artifacts through. Because every
stage is a ``ModelService``, swapping a backend (mock → LatentSync) is a config
change, not a code change here.

Compliance gates run *before* any compute:
  - avatar must be a consented, ACTIVE avatar
  - a cloned voice must have active voice consent
  - the script must pass the refusal screen
A gate failure raises and the job is marked REJECTED, never RUNNING.
"""
from __future__ import annotations

from ..compliance.consent import ConsentError, assert_avatar_usable, ensure_voice_consent
from ..compliance.refusal import RefusalError, screen_script
from ..config import Settings, get_settings
from ..schemas import Avatar, Job, JobArtifacts
from ..services import (
    build_lipsync_service,
    build_post_service,
    build_script_service,
    build_tts_service,
)
from ..store import Store


class PipelineError(RuntimeError):
    """A stage failed after compliance gates passed."""


def _preflight(job: Job, avatar: Avatar, store: Store) -> None:
    """Compliance gates. Raise ConsentError / RefusalError to reject the job."""
    assert_avatar_usable(avatar, store)
    ensure_voice_consent(job.request.voice, store)
    screen = screen_script(job.request.script)
    if not screen.allowed:
        raise RefusalError("; ".join(screen.reasons))


def run_pipeline(job: Job, avatar: Avatar, store: Store,
                 settings: Settings | None = None) -> JobArtifacts:
    """Run the full core loop and return the produced artifacts.

    Raises ConsentError/RefusalError for compliance rejections (caller marks the
    job REJECTED) and PipelineError for downstream failures (marked FAILED).
    """
    settings = settings or get_settings()
    req = job.request

    _preflight(job, avatar, store)

    try:
        script_svc = build_script_service(settings.script_backend)
        tts_svc = build_tts_service(settings.tts_backend)
        lipsync_svc = build_lipsync_service(settings.lipsync_backend)
        post_svc = build_post_service("mock")

        script = script_svc.run(script=req.script).meta["text"]

        tts = tts_svc.run(
            script=script,
            language=req.language,
            voice_id=req.voice.stock_voice_id,
        )
        if tts.duration_seconds > settings.max_output_seconds:
            raise PipelineError(
                f"generated audio {tts.duration_seconds}s exceeds Phase 1 ceiling "
                f"of {settings.max_output_seconds}s"
            )

        sync = lipsync_svc.run(
            source_video_uri=avatar.source_video_uri,
            audio_uri=tts.uri,
            resolution=settings.max_output_height,
        )

        post = post_svc.run(
            job_id=job.id,
            video_uri=sync.uri,
            models_used=[tts_svc.model_key, lipsync_svc.model_key, post_svc.model_key],
            free_tier=settings.force_visible_watermark,
        )
    except (ConsentError, RefusalError):
        raise
    except PipelineError:
        raise
    except Exception as exc:  # noqa: BLE001 — normalise stage failures
        raise PipelineError(str(exc)) from exc

    provenance_uri = f"mock://post/{job.id}/provenance.json" if post.provenance else None
    return JobArtifacts(
        audio_uri=tts.uri,
        video_uri=post.uri,
        provenance_uri=provenance_uri,
        duration_seconds=tts.duration_seconds,
    )
