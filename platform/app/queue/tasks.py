"""Queue-first async execution (PRD §5).

"Nothing in this pipeline is interactive. Design the UX around notification, not
around a spinner." Job submission enqueues a Celery task and returns immediately;
the worker runs the pipeline and writes status back to the store.

In development ``celery_task_always_eager`` is True, so the task runs inline in
the API process — no broker or worker required to exercise the full loop.
"""
from __future__ import annotations

from celery import Celery

from ..compliance.consent import ConsentError
from ..compliance.refusal import RefusalError
from ..config import get_settings
from ..pipeline import PipelineError, run_pipeline
from ..schemas import Job, JobStatus
from ..store import get_store

settings = get_settings()

celery_app = Celery(
    "avatar_video",
    broker=settings.celery_broker_url,
    backend=settings.celery_result_backend,
)
celery_app.conf.task_always_eager = settings.celery_task_always_eager
# In eager mode the task persists status to our own Store, so we do not touch
# Celery's result backend (which would require a live Redis just to run tests).
celery_app.conf.task_store_eager_result = False


@celery_app.task(name="generate_video")
def generate_video(job_id: str) -> str:
    """Run the pipeline for a queued job and persist the outcome."""
    store = get_store()
    job = store.get_job(job_id)
    if job is None:
        raise KeyError(f"job {job_id} not found")

    avatar = store.get_avatar(job.request.avatar_id)
    if avatar is None:
        job.status = JobStatus.FAILED
        job.error = f"avatar {job.request.avatar_id} not found"
        store.save_job(job)
        return job.status.value

    job.status = JobStatus.RUNNING
    store.save_job(job)

    try:
        artifacts = run_pipeline(job, avatar, store)
    except (ConsentError, RefusalError) as exc:
        job.status = JobStatus.REJECTED
        job.error = str(exc)
    except PipelineError as exc:
        job.status = JobStatus.FAILED
        job.error = str(exc)
    else:
        job.artifacts = artifacts
        job.status = JobStatus.SUCCEEDED
        job.error = None

    store.save_job(job)
    return job.status.value


def submit_job(job: Job) -> None:
    """Persist a queued job and enqueue it. Returns immediately (async by default)."""
    store = get_store()
    job.status = JobStatus.QUEUED
    store.add_job(job)
    generate_video.delay(job.id)
