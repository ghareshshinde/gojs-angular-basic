.PHONY: install test run worker audit

install:
	pip install -r requirements.txt

test:
	pytest -q

run:
	uvicorn app.main:app --reload

worker:
	celery -A app.queue.tasks.celery_app worker --loglevel=info

# Print the license audit: which models may ship, which are traps.
audit:
	@python -c "from app.models_registry import CATALOG; \
	[print(f\"{'OK ' if m.shippable else 'NO '} {m.key:16} {m.license:16} {m.notes}\") for m in CATALOG.values()]"
