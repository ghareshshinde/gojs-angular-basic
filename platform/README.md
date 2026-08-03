# Open-Weight AI Avatar Video Platform — Phase 1 Foundation

A runnable scaffold for the script-to-video **avatar** pipeline described in the
PRD (Draft v0.1). This is the **Phase 1 core loop**, not the finished product.

## What this is (and is not)

This foundation encodes the PRD's load-bearing decisions so they are hard to
regress later:

- **Decoupled per-model services behind a stable interface** (§5). Every model
  sits behind `ModelService` and is looked up through a registry, so a model can
  be swapped without touching orchestration. Model churn in this space is extreme.
- **Queue-first, async by default** (§5). Job submission returns immediately; the
  pipeline runs on a worker. The UX is built around notification, not a spinner.
- **Consent gating is non-negotiable** (§8). No avatar can be used in a job until a
  recorded, timestamped consent statement exists. This is enforced in code, with
  no "enterprise override" path.
- **Provenance on every output** (§8). C2PA signing + visible watermark run as a
  mandatory post stage.
- **License audit as data, not a footnote** (§4, §8). The model registry carries
  each model's license and a machine-checked `shippable` flag. Non-commercial
  traps (FLUX.1 [dev], XTTS-v2, HunyuanVideo territorial) are encoded so a
  non-shippable model cannot be wired into a production pipeline by accident.

**Mock backends.** The model adapters (TTS, lip-sync, script, post) ship with
mock implementations so the whole pipeline runs end-to-end today with no GPU.
Real adapters (LatentSync, F5-TTS, CosyVoice 2, Kokoro) implement the same
interface and drop in behind the registry.

**Not in scope here:** multi-language (Phase 2), batch/API (Phase 2), self-hosted
Helm/RBAC/SSO (Phase 3), generative B-roll (Phase 4). The interfaces are shaped so
those land without a rewrite.

## Layout

```
platform/
  app/
    api/            FastAPI routers: avatars, consent, jobs, health
    compliance/     consent gating, C2PA/watermark provenance, refusal layer
    models_registry/ model catalog + license audit (PRD §4)
    services/       ModelService interface + TTS/lipsync/script/post adapters
    pipeline/       stage definitions + DAG orchestrator (script→tts→lipsync→post)
    queue/          Celery tasks (queue-first async)
    schemas.py      pydantic domain models
    config.py       settings
    store.py        repository interface + in-memory impl (Postgres later)
    main.py         FastAPI app factory
  tests/            consent-gating, license-audit, pipeline, api tests
```

## Running

```bash
cd platform
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# API (queue runs inline in dev via CELERY_TASK_ALWAYS_EAGER)
uvicorn app.main:app --reload

# Tests
pytest -q
```

With Docker (adds Postgres, Redis, MinIO, a Celery worker):

```bash
docker compose up --build
```

## Phase mapping

| PRD phase | Here |
|---|---|
| P1 avatar create + consent gate | `api/avatars`, `api/consent`, `compliance/consent` |
| P1 script→voice→sync→post loop  | `pipeline/`, `services/` |
| P1 watermark + C2PA provenance  | `compliance/provenance`, `services/post` |
| P2 multi-language / batch / API | interfaces present, adapters TODO |
| P3 on-prem / RBAC / LoRA        | not started |

See `app/models_registry/licenses.py` for the license audit and the `shippable`
gate that keeps non-commercial models out of production pipelines.
