"""Consent capture (PRD §6, §8).

Consent must be captured and stored *before* an avatar activates or a voice is
cloned. The recording URI is mandatory — the API will not accept a consent record
that only asserts a checkbox.
"""
from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ..schemas import ConsentKind, ConsentRecord
from ..store import get_store

router = APIRouter(prefix="/consent", tags=["consent"])


class ConsentCreate(BaseModel):
    subject_id: str
    kind: ConsentKind
    recording_uri: str  # pointer to the on-camera consent statement (required)
    statement_transcript: str = ""


@router.post("", status_code=201)
def create_consent(body: ConsentCreate) -> ConsentRecord:
    if not body.recording_uri.strip():
        raise HTTPException(422, "recording_uri is required; a checkbox is not consent")
    record = ConsentRecord(**body.model_dump())
    return get_store().add_consent(record)


@router.post("/{consent_id}/revoke")
def revoke_consent(consent_id: str) -> ConsentRecord:
    store = get_store()
    record = store.get_consent(consent_id)
    if record is None:
        raise HTTPException(404, "consent not found")
    from ..schemas import utcnow

    record.revoked_at = utcnow()
    store.add_consent(record)
    return record
