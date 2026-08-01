# Saarthi — Foundational Engineering Contract

> **Saarthi** is an AI-native **Family Operating System**: it orchestrates every financial,
> legal, administrative, healthcare, educational, governmental, and lifestyle responsibility
> across a family's lifetime, so the human stops being the integration layer.

This folder contains the **three artifacts that must exist before a line of feature code is
written**. Together they form the engineering contract that every service, agent, and connector
implements against.

| # | Document | What it defines | Primary consumers |
|---|----------|-----------------|-------------------|
| 1 | [Family Digital Twin Specification](./01-family-digital-twin-spec.md) | Every entity, attribute, relationship, lifecycle state, and event in the single source of truth | Data platform, Knowledge Graph, all services |
| 2 | [Workflow Catalog](./02-workflow-catalog.md) | The real family workflows Saarthi executes — inputs, approvals, integrations, outcomes | Workflow Engine, Planner, AI agents |
| 3 | [Connector Registry](./03-connector-registry.md) | Every planned integration — API availability, consent model, regulatory constraints, auth, fallback | Connector Platform, Consent Engine, Security |
| + | [AI Architecture & Assurance](./04-ai-architecture-and-assurance.md) | How the AI features are powered, and how accuracy is guaranteed — containment model, evaluation program, guardrails, trust-gated automation | AI platform, ML/eval, QA |

## Why these three, in this order

Saarthi is **workflow-first, AI-enhanced** — deterministic systems deliver reliability and
governance; AI enhances them, it does not replace them. The dependency order is:

```
Family Digital Twin  →  Policy Engine  →  Workflow Engine  →  Connector Platform
        →  Event Bus  →  Knowledge Graph  →  AI Reasoning  →  User Experience
```

- The **FDT Spec** gives every workflow and connector a shared vocabulary of entities and events.
- The **Workflow Catalog** gives the Workflow Engine and Planner their unit of work, and tells us
  *which* connectors and *which* FDT entities each responsibility touches.
- The **Connector Registry** grounds every workflow step in a real, consent-governed integration —
  or an explicit fallback when no API exists.

Read them together: a Workflow Catalog entry names FDT entities it reads/writes and Connectors it
calls; a Connector Registry entry names the FDT entities it populates; the FDT Spec is the schema
both sides agree on.

## Conventions used across all three documents

- **Identifiers.** Every canonical object has a stable `saarthi:<type>:<uuid>` URN. External
  identifiers (Aadhaar, PAN, policy numbers) are *attributes*, never primary keys.
- **Sensitivity classes.** `PUBLIC` · `INTERNAL` · `PII` · `SENSITIVE_PII` · `FINANCIAL` ·
  `HEALTH` · `CREDENTIAL`. Drives encryption, masking, residency, and consent scope.
- **Consent-linked.** Any attribute sourced from a regulated connector carries a `consent_ref`
  back to the DEPA/AA/DPDP consent artifact that authorised its collection.
- **Temporal model.** The Twin is **bitemporal**: every fact has a `valid_time` (when it was true
  in the world) and a `system_time` (when Saarthi learned it). Nothing is hard-deleted.
- **Human-in-the-loop.** Where a step mutates the real world (money movement, a government filing,
  an address change) the workflow carries an explicit `approval` gate. *AI should think; humans
  should decide.*

## Status & coverage

These are v1.0 living specifications. The Workflow Catalog ships a fully-specified representative
set plus an indexed enumeration that scales to the 500–1,000 target; the Connector Registry
covers the India Stack and the highest-priority private integrations. Coverage notes and
open questions are called out inline in each document.
