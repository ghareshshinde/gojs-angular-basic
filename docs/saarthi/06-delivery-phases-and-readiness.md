# Delivery Phases, Readiness & Gap Register — v1.0

> The purpose of this document is that **no major structural change is forced later**. It defines
> the delivery phases (prototype → MVP → beta → production/scale), the structural decisions that
> must be locked *now* so they don't require a rewrite, the non-functional targets per phase, and a
> live **gap register** of everything not yet specified — with the document that owns it.

Read alongside the subsystem specs it introduces: Platform & Infrastructure (`07`), Identity &
Access (`08`), Billing & Monetization (`09`), Security & Compliance (`10`).

---

## 1. Delivery phases

| Phase | Goal | Scope | Users | Data |
|-------|------|-------|-------|------|
| **P-0 Prototype** | Prove the loop: Twin → workflow → connector → suggestion → decision | 1–2 P0 workflows end-to-end (e.g. health renewal), mocked connectors, single-tenant | Internal / design partners | Synthetic + own data |
| **P-1 MVP** | Deliver real value on the Phase-1 spine | P0 workflow set, real AA/DigiLocker/BBPS/UPI, onboarding, persona login, free tier | Closed beta families | Real, consented, small scale |
| **P-2 Beta / GA** | Monetise & harden | Paid plans + trial→lock + autopay, more workflows, support console, SLAs | Paying families | Real, regulated, growing |
| **P-3 Production scale** | Scale, resilience, breadth | Multi-region readiness, full catalog expansion, marketplace, high automation tiers | Public | Real, at scale |

**Automation ceiling rises with phase:** prototype = `observe/suggest`; MVP = `assist`;
beta = `auto_with_approval`; scale = `auto` within Policy-Engine limits (`02 §6`, `04 §8`).

---

## 2. Structural decisions to lock now (so nothing forces a rewrite)

These are the "get-it-right-once" choices. Each is cheap to honour from P-0 and expensive to retrofit.

| # | Decision | Why it must be early | Where specified |
|---|----------|----------------------|-----------------|
| 1 | **Event-sourced, bitemporal Twin** as system of record; graph/SQL are projections | Retrofitting audit/temporal onto a mutable store is a rewrite | `01 §1,§5` |
| 2 | **Multi-tenant with `family_id` as the hard partition** from day one (even at single tenant) | Tenancy isolation cannot be bolted on safely later | `07 §3` |
| 3 | **Data residency: India-region for regulated classes**, partitionable by region | DPDP/RBI/ABDM localisation; region migration is painful | `07 §4`, `10` |
| 4 | **Stateless, containerised, K8s-native services**; 12-factor config; no local state | Enables horizontal scale, HA, portability without redesign | `07 §2` |
| 5 | **Identity plane separate from Person**; AuthN/AuthZ as a service; ABAC over FDT | Persona login, delegation, break-glass all depend on it | `08` |
| 6 | **Entitlement check as a single enforcement point** (API gateway / policy layer), not scattered `if plan==` | Feature-gating sprawl is the classic monetisation rewrite | `09 §4` |
| 7 | **Money-movement & card data isolated** in a PCI-minimised service; tokenise, never store PAN | PCI scope explosion + regulatory risk if mixed in | `09 §5`, `10 §4` |
| 8 | **Consent as a first-class service** with `consent_ref` on every regulated datum — incl. email/SMS discovery scopes | DEPA/ABDM/DPDP + Google restricted-scope rules are non-negotiable and cross-cutting | `03 §1,§6A`, `10 §3` |
| 9 | **Connector SDK contract + fallback ladder** so integrations are pluggable | Avoids per-integration bespoke rewrites | `03 §1` |
| 10 | **Async, idempotent, checkpointed workflows** (Temporal/Camunda) | Long-running real-world workflows can't be synchronous | `02 §7` |
| 11 | **Secrets in a vault, never in the graph/repo/env**; per-tenant encryption keys | Key/secret model is foundational to security posture | `10 §4` |
| 12 | **Observability & audit built in from P-0** (OTel traces, immutable audit log) | Instrumentation added late has blind spots | `04 §7`, `10 §6` |

If these twelve hold, feature growth is additive — new workflows, connectors, plans, and personas
slot into existing structure.

---

## 3. Non-functional requirements (targets by phase)

| NFR | P-0 | P-1 MVP | P-2 Beta | P-3 Scale |
|-----|-----|---------|----------|-----------|
| Availability (core APIs) | best-effort | 99.0% | 99.5% | 99.9% |
| Interactive latency (p95) | — | < 1.5s | < 800ms | < 500ms |
| Workflow durability | in-memory ok | persisted | persisted + retries | multi-AZ, exactly-once effects |
| RPO / RTO (DR) | — | RPO 24h / RTO 24h | RPO 1h / RTO 4h | RPO 5m / RTO 1h |
| Data residency | dev region | India-region regulated | enforced + audited | multi-region ready |
| Security posture | basic | SSO/MFA, encryption, secrets vault | pen-test, VDP | SOC2/ISO track, red team |
| Scale (families) | 10s | 100s–1k | 10k+ | 100k–1M+ |
| Backup/restore | none | daily, tested | PITR | PITR + geo-redundant |

SLOs, error budgets, and alerting thresholds are elaborated in `07 §6`.

---

## 4. Gap register — what is not yet specified (and who owns it)

Status: ✅ specified · 🟡 partial/stub · 🔴 named-only. Each row points to its owning document.

| Area | Status | Owner doc | Notes |
|------|--------|-----------|-------|
| Family Digital Twin | ✅ | `01` | core complete; Preparedness/Trust score formulas 🟡 |
| Workflow Catalog | ✅ (spine) | `02` | 15 exemplars; long tail 🟡 (expands by design) |
| Connector Registry | ✅ (P0/P1) | `03` | Connector **SDK contract** itself 🟡 |
| AI Architecture & Assurance | ✅ | `04` | calibration model 🟡 |
| Product Context | ✅ | `05` | — |
| **Platform & Infrastructure (K8s, multi-tenancy, residency, DR, scaling)** | 🟡 → this release | `07` | new |
| **Identity & Access (persona login, RBAC/ABAC, MFA, delegation, break-glass)** | 🟡 → this release | `08` | new |
| **Billing & Monetization (plans, trial→lock, autopay, entitlements, dunning)** | 🟡 → this release | `09` | new |
| **Security & Compliance program (cyber controls, threat model, regulatory, IR)** | 🟡 → this release | `10` | new |
| Notification & channel service (push/SMS/email/WhatsApp, preferences, quiet hours) | 🔴 | `07 §5` (stub) | high priority for reminders |
| Document intelligence pipeline (OCR→classify→extract→verify) detail | 🟡 | `03 §7`, `04` | referenced; needs own flow |
| Admin / Support / Ops console | 🔴 | Bible Vol 15 | needed by P-2 |
| Analytics & metrics platform (north-star instrumentation) | 🔴 | Bible Vol 14 | needed to measure success metrics |
| Mobile & Web app architecture (offline, state, design system) | 🔴 | Bible Vol 10/11 | needed by P-1 |
| Marketplace & Developer APIs | 🔴 | Bible Vol 9 | P-3 |
| Preparedness Index / Trust Score computation | 🔴 | own spec | referenced by 3 subsystems |
| Data lifecycle: retention, archival, erasure (DPDP), export/portability | 🟡 | `10 §5` | partial in FDT §7 |
| **Email/SMS discovery ingestion** (primary net-worth discovery) | 🟡 → specified | `03 §6A` | pipeline detail + Google CASA assessment pending |
| **Net-worth realisation** (self + family) | ✅ | `01 §3.9`, `WF-FIN-021` | headline capability |
| **In-app investing** — account opening, ETF/SIF/US equity, bonds/gold | 🟡 | `03 §6B`, `WF-INV-021…027` | needs partner + licence |
| **Lending / quick loan / LAMF** | 🟡 | `03 §6C`, `WF-FIN-024…025` | needs NBFC/LSP partner |
| **Advisory & consultation marketplace** (doctor/CA/RIA) | 🟡 | `03 §6D`, `WF-SVC-*` | provider integrations |
| **Warranty / refund / order tracking** | 🟡 | `WF-HOME-010…012` | depends on email ingestion |
| **Regulated-entity / licensing strategy** (RIA·ARN·broker·NBFC·IRDAI·LRS) | 🔴 open decision | `03 §6E`, `10 §8` | **structural business decision — gates half the money features** |
| Spending analytics & budgeting; rewards aggregation | 🟡 | `WF-FIN-023, WF-FIN-026` | on ingestion + AA |
| Localization / i18n / multi-language (India-first, many languages) | 🔴 | Bible Vol 10/11 | UX-critical |
| Accessibility (WCAG), esp. for seniors | 🔴 | Bible Vol 10/11 | persona-driven |
| Cost model / FinOps (inference + infra unit economics) | 🔴 | `07 §7` (stub) | margin discipline |

---

## 5. Phase-gate checklist (must-pass to advance)

**Enter MVP (P-1):** structural decisions §2 (1–12) honoured · persona login + family onboarding
live · ≥1 real regulated connector with consent · audit log on · India-region storage · daily
backups tested.
**Enter Beta/GA (P-2):** paid plans + trial→lock + autopay working · entitlement enforcement single
point · pen-test passed · IR runbook · SLA/on-call · support console · DPDP data-rights flows.
**Enter Scale (P-3):** multi-AZ HA · DR drill met RPO/RTO · autoscaling · SOC2/ISO track started ·
red-team · cost model within target · automation tiers gated by measured accuracy.

---

### Open questions / v1.1 candidates
- Build vs partner for KYC/AA/payment aggregation (affects PCI/regulatory scope).
- Single-region-first vs multi-region-from-start (cost vs future migration risk).
- Which Bible volumes (Notifications, Analytics, Mobile/Web, Admin) to spec next — Notifications and
  Mobile/Web are P-1 blockers.
