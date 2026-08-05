"""FastAPI application factory (PRD §5: API gateway — auth, quota, billing).

Auth/quota/billing middleware are Phase 1 TODOs; the router surface and the
compliance gates are what this scaffold locks in.
"""
from __future__ import annotations

from fastapi import FastAPI

from . import __version__
from .api import avatars, consent, health, jobs


def create_app() -> FastAPI:
    app = FastAPI(
        title="Open-Weight AI Avatar Video Platform",
        version=__version__,
        summary="Phase 1 core-loop foundation: script → voice → lip-sync → post.",
    )
    app.include_router(health.router)
    app.include_router(consent.router)
    app.include_router(avatars.router)
    app.include_router(jobs.router)
    return app


app = create_app()
