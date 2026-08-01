# Saarthi — Foundational Engineering Contract

> **Saarthi** is an AI-native **Family Operating System**: it orchestrates every financial, legal,
> administrative, healthcare, educational, governmental, and lifestyle responsibility across a
> family's lifetime, so the human stops being the integration layer.

This folder is the **maintained source of truth** for Saarthi. It is written so that a new
session — or a new engineer — can reconstruct full context from these documents *without reading
any chat history*. If you are here cold, read in the order below.

## Reading order

| Read | Document | What it gives you |
|------|----------|-------------------|
| **1st** | [Product Context (Volume 0)](./05-product-context.md) | The why/what: vision, principles, north-star, personas, scope, roadmap, business model, the workflow-first stance |
| 2nd | [Family Digital Twin Specification](./01-family-digital-twin-spec.md) | Every entity, attribute, relationship, lifecycle state, and event in the single source of truth |
| 3rd | [Workflow Catalog](./02-workflow-catalog.md) | The real family workflows Saarthi runs — inputs, approvals, integrations, outcomes |
| 4th | [Connector Registry](./03-connector-registry.md) | Every planned integration — API availability, consent model, regulatory constraints, auth, fallback |
| 5th | [AI Architecture & Assurance](./04-ai-architecture-and-assurance.md) | How the AI is powered and how accuracy is guaranteed — containment, evaluation, guardrails, trust-gated automation |
| — | [`index.html`](./index.html) | Self-contained, theme-aware **stakeholder overview** distilling all of the above |

**Operating the platform** (how it's built, secured, and monetised — read when planning delivery):

| # | Document | What it gives you |
|---|----------|-------------------|
| 06 | [Delivery Phases, Readiness & Gap Register](./06-delivery-phases-and-readiness.md) | Phases (prototype→MVP→beta→scale), the **structural decisions to lock now**, NFR/SLO targets, and the live **gap register** of what's not yet specified |
| 07 | [Platform & Infrastructure](./07-platform-infrastructure.md) | Kubernetes-native, multi-tenancy, data residency, scaling, DR/BCP, shared platform services |
| 08 | [Identity & Access](./08-identity-access.md) | Persona-wise login, AuthN (passkeys/MFA/step-up), ABAC authorisation, delegation, break-glass |
| 09 | [Billing & Monetization](./09-billing-monetization.md) | Plans (monthly/annual), free trial → lock, **autopay scheduled ahead**, entitlement gating, dunning |
| 10 | [Security & Compliance Program](./10-security-compliance.md) | Zero-trust controls, threat model, DPDP/RBI/IRDAI/ABDM/PCI mapping, SDLC, incident response |

`05` is the framing; `01`–`04` are the engineering contract every service, agent, and connector
implements against — the artifacts that had to exist *before* a line of feature code. `06`–`10`
are the **operational contract**: how the platform is delivered, run, secured, and paid for, with
`06` as the hub that tracks what's still missing.

## Why this order — the governing stance

Saarthi is **workflow-first, AI-enhanced**: deterministic systems deliver reliability and
governance; AI enhances them, it does not replace them. Dependency order:

```
Family Digital Twin  →  Policy Engine  →  Workflow Engine  →  Connector Platform
        →  Event Bus  →  Knowledge Graph  →  AI Reasoning  →  User Experience
```

The documents interlock: a Workflow Catalog entry names the **FDT entities** it reads/writes and
the **Connectors** it calls; a Connector Registry entry names the **FDT entities** it populates;
the FDT Spec is the schema both agree on; the AI Assurance spec governs how the reasoning layer
stays correct.

## Conventions used across all documents

- **Identifiers.** Every canonical object has a stable `saarthi:<type>:<uuid>` URN. External
  identifiers (Aadhaar, PAN, policy numbers) are *attributes*, never primary keys.
- **Sensitivity classes.** `PUBLIC` · `INTERNAL` · `PII` · `SENSITIVE_PII` · `FINANCIAL` ·
  `HEALTH` · `CREDENTIAL`. Drives encryption, masking, residency, and consent scope.
- **Consent-linked.** Any attribute from a regulated connector carries a `consent_ref` back to the
  DEPA/AA/ABDM/DigiLocker/DPDP consent artifact that authorised its collection.
- **Temporal model.** The Twin is **bitemporal**: every fact has `valid_time` (true in the world)
  and `system_time` (when Saarthi learned it). Nothing is hard-deleted.
- **Human-in-the-loop.** Every step that mutates the real world (money, a government filing, an
  address change) carries an explicit `approval` gate. *AI thinks; humans decide.*

## Maintenance protocol (base-truth discipline)

**These documents are kept current as decisions are made, so context lives here, not in chat.**

1. When a product/architecture decision is made or refined in any session, **fold it into the
   relevant spec** (and Volume 0 if it changes framing) in the *same* change — don't leave it in
   conversation only.
2. **Record it in the Decision Log below** (one line: what was decided and where it landed).
3. Prefer **cross-reference over duplication** — state a fact once, in its home document, and link
   to it. This prevents drift.
4. Keep each document's **"Open questions / v1.1 candidates"** section honest — move items out as
   they're resolved.
5. The `index.html` overview is a *distillation*; refresh it when a change alters the headline
   story, and republish (same file path keeps the artifact URL).

## Decision Log

Newest first. Each entry: the decision and the document(s) it lives in.

| Date | Decision | Landed in |
|------|----------|-----------|
| 2026-08-01 | **Money super-app scope (INDmoney-inspired, extended)**: email/SMS as the *primary* net-worth discovery channel; Net Worth as a headline projection; new instruments (ETF/SIF/US equity/bonds/gold) + in-app account opening; lending (quick loan/LAMF); advisory & consultation marketplace (new **SVC** domain); warranty/refund/rewards tracking. Regulated-entity **licensing posture = partner-first** (RIA·ARN·broker·NBFC/LSP·IRDAI·LRS) flagged as an open structural business decision | `01 §3.9`, `02` (SVC + WF-FIN/INV/HOME/SVC-*), `03 §6A–6E`, `05 §1a,§11`, `10 §8`, `06 §4` |
| 2026-08-01 | **Operational contract added** so no major structural change is forced later: delivery phases + gap register + 12 structural-lock-now decisions; K8s-native platform, multi-tenancy & residency; persona-wise identity/access; billing (trial→lock→pre-scheduled autopay, single-point entitlement gating); security & compliance program (DPDP/RBI/IRDAI/ABDM/PCI) | `06`, `07`, `08`, `09`, `10`; FDT `01 §3.8`; catalog WF-FAM-014…018 |
| 2026-08-01 | **Continuous learning from decisions**: capture every suggestion's outcome + reason (volunteered / asked / inferred) from day one; two-speed learning — immediate reversible per-family preferences via retrieval + governed de-identified aggregate model improvement (no live per-user fine-tuning) | `01` (Suggestion/DecisionFeedback/Preference + Decision.*/Learning.* events), `02` (WF-FAM-013 + global rule), `04 §6` |
| 2026-08-01 | Captured founder-vision / product context (vision, principles, personas, scope, roadmap, business model) as durable base truth; established this maintenance protocol + decision log | `05`, `00` |
| 2026-08-01 | AI is **contained**, not trusted: five-layer containment model, golden-set evaluation in CI, per-action-class accuracy targets, trust-gated automation | `04` |
| 2026-08-01 | AI stack: LiteLLM router over GLM/Qwen/Llama/DeepSeek/Gemma, self-hosted vLLM in-region for regulated data; Planner + ~12 domain agents; grounded memory + GraphRAG | `04 §2` |
| 2026-08-01 | Governing stance set to **workflow-first, AI-enhanced** (revised from AI-first) | `05 §3`, all |
| 2026-08-01 | Deliverable = the three (now four) foundational specs as Markdown + a shareable web overview; committed to `claude/saarthi-prd-yocfkj`, draft PR #2 | this folder |
| 2026-08-01 | North-star metric = **Responsibilities Successfully Managed**, not DAU | `05 §1` |

## Status & coverage

These are v1.0 living specifications. The Workflow Catalog ships a fully-specified representative
set plus an indexed enumeration scaling to the 500–1,000 target; the Connector Registry covers the
India Stack and highest-priority private integrations. Coverage notes and open questions are called
out inline in each document.

## Roadmap for these docs (the wider Bible)

This set is the engineering-contract core of a larger intended **Product Requirements Bible**
(Volumes 0–15). Now covered here: Product Context (`05`), FDT, Workflow, Connector, AI Assurance,
Platform/Infra & DevOps (`07`), Identity & Access (`08`), Billing (`09`), Security & Compliance
(`10`). Still to elaborate on demand — tracked in the gap register (`06 §4`): **Notification
service**, **Mobile & Web app architecture** (both P-1 blockers), **Analytics platform**,
**Admin/Support console**, **Marketplace & Developer APIs**, and the **Preparedness Index / Trust
Score** computation. See `05 §12`.
