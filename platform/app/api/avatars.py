"""Avatar creation + consent-gated activation (PRD §6, §8)."""
from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ..compliance.consent import ConsentError, activate_avatar
from ..compliance.refusal import screen_subject
from ..schemas import Avatar
from ..store import get_store

router = APIRouter(prefix="/avatars", tags=["avatars"])


class AvatarCreate(BaseModel):
    account_id: str
    display_name: str
    source_video_uri: str  # the ~2-minute user-recorded source video


class AvatarActivate(BaseModel):
    consent_id: str


@router.post("", status_code=201)
def create_avatar(body: AvatarCreate) -> Avatar:
    # Refusal layer: block public-figure likenesses at creation (PRD §8 #4).
    screen = screen_subject(body.display_name)
    if not screen.allowed:
        raise HTTPException(403, {"blocked": screen.reasons})
    avatar = Avatar(**body.model_dump())  # starts PENDING_CONSENT
    return get_store().add_avatar(avatar)


@router.post("/{avatar_id}/activate")
def activate(avatar_id: str, body: AvatarActivate) -> Avatar:
    store = get_store()
    avatar = store.get_avatar(avatar_id)
    if avatar is None:
        raise HTTPException(404, "avatar not found")
    avatar.consent_id = body.consent_id
    try:
        return activate_avatar(avatar, store)
    except ConsentError as exc:
        raise HTTPException(422, str(exc)) from exc


@router.get("/{avatar_id}")
def get_avatar(avatar_id: str) -> Avatar:
    avatar = get_store().get_avatar(avatar_id)
    if avatar is None:
        raise HTTPException(404, "avatar not found")
    return avatar
