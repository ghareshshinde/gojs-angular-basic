"""API-level walkthrough of the Phase 1 happy path + the consent gate (PRD §6)."""
import pytest
from fastapi.testclient import TestClient

from app.main import create_app


@pytest.fixture()
def client():
    return TestClient(create_app())


def test_full_flow_consent_avatar_job(client):
    # 1. capture likeness consent (recording required)
    consent = client.post("/consent", json={
        "subject_id": "casey",
        "kind": "likeness",
        "recording_uri": "s3://consent/casey.mp4",
    })
    assert consent.status_code == 201
    consent_id = consent.json()["id"]

    # 2. create avatar — starts pending_consent
    avatar = client.post("/avatars", json={
        "account_id": "acct",
        "display_name": "Casey",
        "source_video_uri": "s3://src/casey.mp4",
    })
    assert avatar.status_code == 201
    avatar_id = avatar.json()["id"]
    assert avatar.json()["status"] == "pending_consent"

    # 3. job before activation → rejected (not run)
    early = client.post("/jobs", json={
        "account_id": "acct", "avatar_id": avatar_id,
        "script": "Hello team.", "voice": {"stock_voice_id": "narrator-1"},
    })
    assert early.json()["status"] == "rejected"

    # 4. activate with consent
    act = client.post(f"/avatars/{avatar_id}/activate", json={"consent_id": consent_id})
    assert act.status_code == 200
    assert act.json()["status"] == "active"

    # 5. job now succeeds with provenance
    job = client.post("/jobs", json={
        "account_id": "acct", "avatar_id": avatar_id,
        "script": "Welcome to the onboarding course.",
        "voice": {"stock_voice_id": "narrator-1"},
    })
    body = job.json()
    assert body["status"] == "succeeded"
    assert body["artifacts"]["provenance_uri"] is not None


def test_consent_requires_recording(client):
    resp = client.post("/consent", json={
        "subject_id": "casey", "kind": "likeness", "recording_uri": "   ",
    })
    assert resp.status_code == 422


def test_public_figure_blocked_at_creation(client):
    resp = client.post("/avatars", json={
        "account_id": "acct",
        "display_name": "Elon Musk",
        "source_video_uri": "s3://src/x.mp4",
    })
    assert resp.status_code == 403


def test_health(client):
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"
