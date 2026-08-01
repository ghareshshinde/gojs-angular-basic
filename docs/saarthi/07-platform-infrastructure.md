# Platform & Infrastructure — v1.0

> How Saarthi runs. Cloud-native and **Kubernetes-native from day one**, multi-tenant with a hard
> `family_id` partition, India-region for regulated data, horizontally scalable, and resilient.
> Designed so scale is additive, not a rewrite (see `06 §2`).

---

## 1. Principles
1. **Stateless services, stateful backing stores.** No service holds local state; all state lives
   in the event store, databases, cache, or object store. Any pod can die or move.
2. **12-factor + cloud-native.** Config via env/secret injection; build once, promote across
   environments; logs as streams; disposable processes.
3. **Async-first.** Event bus between services; long-running work in the workflow engine, never in a
   request thread.
4. **Portability over lock-in.** Kubernetes + open components (`03 §7`) so we can run on any major
   cloud or self-host for residency.

## 2. Compute — Kubernetes-native
- **Containers on K8s.** Every service ships as an OCI image; deploys via Helm/Kustomize;
  GitOps (Argo CD / Flux) for declarative, auditable rollouts.
- **Health & lifecycle:** liveness/readiness/startup probes; graceful shutdown; `PodDisruptionBudgets`;
  rolling + canary/blue-green deploys.
- **Autoscaling:** HPA (CPU/mem/custom queue-depth), Cluster Autoscaler, and KEDA for event-driven
  scale (e.g. scale OCR workers on Kafka lag). Self-hosted **vLLM inference on GPU node pools**,
  autoscaled separately from stateless web tiers.
- **Isolation:** namespaces per environment; network policies default-deny; sensitive workloads
  (payments, inference on regulated data) on dedicated node pools.
- **Config/secrets:** ConfigMaps for non-secret; **external secrets** synced from the vault
  (`10 §4`) — never baked into images.

## 3. Multi-tenancy
- **`family_id` is the hard partition** on every record, event, cache key, and object path — present
  from P-0 even while single-tenant, so isolation is structural (`06 §2.2`).
- **Pooled compute, isolated data.** Shared services; tenant data segregated by row-level security
  and per-tenant encryption keys (`10 §4`). Option to physically isolate high-value/enterprise tenants.
- **Noisy-neighbour control:** per-tenant rate limits and quotas at the API gateway.

## 4. Data platform & residency
- **System of record:** append-only **event store** (Kafka/Redpanda + durable log); **PostgreSQL**
  (relational + `pgvector`); **Neo4j/Memgraph** (graph projection); **OpenSearch** (search);
  **Redis** (cache); **MinIO/object store** (documents). All are projections rebuildable from events.
- **Residency:** regulated classes (`FINANCIAL/HEALTH/SENSITIVE_PII`) stored **in-region (India)**;
  region is a partition dimension so multi-region is additive. Cross-border only for de-identified
  aggregate signal where lawful.
- **Backups & PITR:** automated, encrypted, tested restores; point-in-time recovery for the event
  store and databases; geo-redundant copies at scale (targets in `06 §3`).

## 5. Platform services (shared)
- **API Gateway / BFF:** authN handoff, entitlement check (`09 §4`), rate limiting, request signing.
- **Notification service** *(stub — gap `06 §4`)*: push / SMS / email / WhatsApp with per-family
  channel preferences, quiet hours, criticality-based escalation, and delivery receipts. Central to
  the reminder-heavy workflows (renewals, bills, deadlines).
- **Scheduling service:** durable timers powering `DueSoon`/`ExpiringSoon` events and autopay
  pre-scheduling (`09 §3`).
- **Document intelligence:** OCR (Docling/PaddleOCR/Tesseract) → classify → extract → verify,
  feeding FDT `Document` entities.
- **Event bus:** the backbone; every state change is an event (`01 §5`).

## 6. Reliability & operations
- **Environments:** dev → staging → prod, identical topology, promoted by GitOps.
- **SLOs & error budgets** per service; golden-signal dashboards (latency, traffic, errors,
  saturation); paging on SLO burn. Tracing/metrics/logs via OTel (`04 §7`).
- **HA:** multi-AZ at P-3; no single point of failure; circuit breakers and bulkheads between
  services and connectors.
- **DR/BCP:** documented runbooks; regular restore drills; RPO/RTO targets per phase (`06 §3`);
  connector-outage fallbacks already modelled in `03`.
- **Progressive delivery:** feature flags, canaries, automated rollback on SLO regression.

## 7. Cost / FinOps *(stub — gap `06 §4`)*
Unit economics tracked per family and per workflow: inference cost (router chooses cheapest model
that meets accuracy — `04 §2.1`), infra, and connector/API fees. Margin discipline gates the
freemium ratio (`09`).

---

### Open questions / v1.1 candidates
- Managed cloud vs self-hosted K8s for the regulated tier (residency vs ops burden).
- Single-region-first vs multi-region-from-start.
- Notification service and Document-intelligence pipeline each warrant their own spec.
