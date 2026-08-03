"""Persistence boundary.

The API and worker talk to a ``Store`` interface, never to a database directly.
Phase 1 ships an in-memory implementation; a Postgres/pgvector implementation
(PRD §5) drops in behind the same interface. A single process-wide instance is
shared so the (eager) worker and the API see the same records in dev.
"""
from __future__ import annotations

import threading
from typing import Optional, Protocol

from .schemas import Avatar, ConsentRecord, Job, utcnow


class Store(Protocol):
    # consent
    def add_consent(self, consent: ConsentRecord) -> ConsentRecord: ...
    def get_consent(self, consent_id: str) -> Optional[ConsentRecord]: ...

    # avatars
    def add_avatar(self, avatar: Avatar) -> Avatar: ...
    def get_avatar(self, avatar_id: str) -> Optional[Avatar]: ...
    def save_avatar(self, avatar: Avatar) -> Avatar: ...

    # jobs
    def add_job(self, job: Job) -> Job: ...
    def get_job(self, job_id: str) -> Optional[Job]: ...
    def save_job(self, job: Job) -> Job: ...


class InMemoryStore:
    def __init__(self) -> None:
        self._lock = threading.RLock()
        self._consents: dict[str, ConsentRecord] = {}
        self._avatars: dict[str, Avatar] = {}
        self._jobs: dict[str, Job] = {}

    def add_consent(self, consent: ConsentRecord) -> ConsentRecord:
        with self._lock:
            self._consents[consent.id] = consent
        return consent

    def get_consent(self, consent_id: str) -> Optional[ConsentRecord]:
        return self._consents.get(consent_id)

    def add_avatar(self, avatar: Avatar) -> Avatar:
        with self._lock:
            self._avatars[avatar.id] = avatar
        return avatar

    def get_avatar(self, avatar_id: str) -> Optional[Avatar]:
        return self._avatars.get(avatar_id)

    def save_avatar(self, avatar: Avatar) -> Avatar:
        with self._lock:
            self._avatars[avatar.id] = avatar
        return avatar

    def add_job(self, job: Job) -> Job:
        with self._lock:
            self._jobs[job.id] = job
        return job

    def get_job(self, job_id: str) -> Optional[Job]:
        return self._jobs.get(job_id)

    def save_job(self, job: Job) -> Job:
        with self._lock:
            job.updated_at = utcnow()
            self._jobs[job.id] = job
        return job


_store: Store = InMemoryStore()


def get_store() -> Store:
    return _store
