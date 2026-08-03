"""Domain models for the Phase 1 core loop.

These are the stable shapes that cross service boundaries. Persistence
(Postgres/pgvector) will map onto these; for now they double as the in-memory
records held by ``store.py``.
"""
from __future__ import annotations

import enum
import uuid
from datetime import datetime, timezone
from typing import Optional

from pydantic import BaseModel, Field


def _uuid() -> str:
    return uuid.uuid4().hex


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class JobStatus(str, enum.Enum):
    QUEUED = "queued"
    RUNNING = "running"
    SUCCEEDED = "succeeded"
    FAILED = "failed"
    REJECTED = "rejected"  # blocked by compliance (consent/refusal), never ran


class AvatarStatus(str, enum.Enum):
    # An avatar cannot leave PENDING_CONSENT until a consent record is attached.
    # This is the enforcement point for PRD §8's non-negotiable consent gate.
    PENDING_CONSENT = "pending_consent"
    ACTIVE = "active"
    SUSPENDED = "suspended"


class ConsentKind(str, enum.Enum):
    LIKENESS = "likeness"  # avatar source video
    VOICE = "voice"        # voice cloning sample


class ConsentRecord(BaseModel):
    """A recorded, timestamped consent statement (PRD §8).

    The PRD requires consent to be *spoken on camera* and stored. Here we store
    the evidence pointer (the recording URI) and an immutable timestamp; a
    checkbox alone is explicitly not a defence.
    """

    id: str = Field(default_factory=_uuid)
    subject_id: str  # the likeness/voice owner
    kind: ConsentKind
    recording_uri: str  # pointer to the on-camera consent statement
    statement_transcript: str = ""
    recorded_at: datetime = Field(default_factory=utcnow)
    revoked_at: Optional[datetime] = None

    @property
    def is_active(self) -> bool:
        return self.revoked_at is None


class Avatar(BaseModel):
    id: str = Field(default_factory=_uuid)
    account_id: str
    display_name: str
    source_video_uri: str  # the 2-minute user-recorded source (PRD §6)
    status: AvatarStatus = AvatarStatus.PENDING_CONSENT
    consent_id: Optional[str] = None
    created_at: datetime = Field(default_factory=utcnow)


class VoiceSpec(BaseModel):
    """Either a stock voice id, or a cloned voice backed by a consented sample."""

    stock_voice_id: Optional[str] = None
    clone_sample_uri: Optional[str] = None
    clone_consent_id: Optional[str] = None

    @property
    def is_clone(self) -> bool:
        return self.clone_sample_uri is not None


class JobRequest(BaseModel):
    account_id: str
    avatar_id: str
    script: str = Field(min_length=1)
    language: str = "en"
    voice: VoiceSpec


class JobArtifacts(BaseModel):
    audio_uri: Optional[str] = None
    video_uri: Optional[str] = None
    provenance_uri: Optional[str] = None  # C2PA manifest sidecar
    duration_seconds: float = 0.0


class Job(BaseModel):
    id: str = Field(default_factory=_uuid)
    request: JobRequest
    status: JobStatus = JobStatus.QUEUED
    error: Optional[str] = None
    artifacts: JobArtifacts = Field(default_factory=JobArtifacts)
    created_at: datetime = Field(default_factory=utcnow)
    updated_at: datetime = Field(default_factory=utcnow)
