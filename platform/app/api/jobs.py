"""Job submission + status (PRD §5, §6).

Submission is async: it enqueues and returns 202 with the job in QUEUED. In dev
the eager queue runs the pipeline inline, so the returned job may already be in a
terminal state by the time the client reads it back via GET.
"""
from __future__ import annotations

from fastapi import APIRouter, HTTPException

from ..queue import submit_job
from ..schemas import Job, JobRequest
from ..store import get_store

router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.post("", status_code=202)
def create_job(req: JobRequest) -> Job:
    store = get_store()
    avatar = store.get_avatar(req.avatar_id)
    if avatar is None:
        raise HTTPException(404, "avatar not found")
    job = Job(request=req)
    submit_job(job)
    # Re-read: under the eager queue the pipeline has already run.
    return store.get_job(job.id) or job


@router.get("/{job_id}")
def get_job(job_id: str) -> Job:
    job = get_store().get_job(job_id)
    if job is None:
        raise HTTPException(404, "job not found")
    return job
