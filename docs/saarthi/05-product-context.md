# Product Context (Volume 0) — v1.0

> The durable framing for everything else. This is the "why" and "what" that the four technical
> specifications (`01`–`04`) implement. If you are picking this project up cold, **read this first**,
> then the README's reading order. It is maintained as base truth — see the README's maintenance
> protocol.

---

## 1. What Saarthi is

**Saarthi** ("saarthi" = charioteer / guide) is an **AI-native Family Operating System**: it
orchestrates every financial, legal, administrative, healthcare, educational, governmental and
lifestyle responsibility across a family's lifetime — so the human stops being the integration
layer between hundreds of disconnected systems.

It is not one product. It is a **platform** — an AI orchestration layer over a Family Digital Twin,
executing a catalog of real family workflows through consent-governed connectors.

- **Vision.** Become the operating system for every family, orchestrating every responsibility
  throughout their lifetime.
- **Mission.** Reduce the cognitive burden of running a family through trusted AI, intelligent
  automation, and orchestration.
- **North-star metric.** **Responsibilities Successfully Managed** — *not* daily active users.

## 2. Product principles (the six commitments)

1. **AI should think. Humans should decide.**
2. **Integrate. Don't recreate.**
3. **Family trust > revenue. Always.**
4. **One source of truth — the Family Digital Twin.**
5. **Automation follows trust.**
6. **Never make life more complicated.**

These are load-bearing: every entity, workflow, and connector in `01`–`04` encodes them (approval
gates, grounding, consent-anchoring, the trust-gated automation ladder).

## 3. The governing architectural stance — workflow-first, AI-enhanced

The single most important design decision. Deterministic systems deliver reliability and
governance; **AI enhances them, it does not replace them.** This fixes the dependency order and is
why the four specs exist before feature code:

```
Family Digital Twin  →  Policy Engine  →  Workflow Engine  →  Connector Platform
        →  Event Bus  →  Knowledge Graph  →  AI Reasoning  →  User Experience
```

- **Workflows** deliver reliability · **Policies** deliver governance · **the Twin** delivers
  context · **AI** delivers intelligence.
- Positioning Saarthi as *workflow-first, AI-enhanced* (rather than "AI-first") is a deliberate
  revision from the earlier AI-first blueprint. Accuracy is an *architecture* property first — see
  `04-ai-architecture-and-assurance.md`.

## 4. Problem statement

A modern family operates across hundreds of disconnected systems — banks, insurance, UPI, mutual
funds, government (Passport/Aadhaar/PAN/FASTag), schools, hospitals, travel, utilities,
subscriptions, taxes. Each demands a different login, reminders, approvals, workflows, and
documents. **The human becomes the integration layer.** Saarthi removes that burden.

## 5. Success metrics

**Primary:** Responsibilities Completed · Automation % · Trust Score · Family Preparedness Index ·
Retention.
**Secondary:** Time Saved · Money Saved · Tax Saved · Government Benefits Claimed · Emergency
Readiness · Insurance Coverage · Financial Health.

(`Preparedness Index` and `Trust Score` are derived FDT projections — see `01 §6`.)

## 6. Target users & personas

**Segments:** Young Professionals · Newly Married Couples · Parents · Families · Business Owners ·
NRIs · Retirees.

**Anchor persona — Rahul, 32, software engineer.** Two kids, a home loan, mutual funds, dependent
parents; uses 21 financial apps. Pain: too many responsibilities, too many systems, constant fear
of forgetting something that matters (a fee, a renewal, a nominee). Saarthi's job is to make sure
he never does.

**Representative user stories** (the emotional contract the catalog serves):
- *"As a father, I never want to forget my daughter's school fees."* → WF-EDU-003
- *"As a son, I want my parents' insurance renewed without worrying."* → WF-INS-004 / WF-INS-019
- *"As a husband, I want every address updated everywhere from one place."* → WF-GOV-010
- *"As a family, we want one dashboard for everything."* → the Twin + Responsibility triage (WF-FAM-006)

## 7. Scope & phasing

| Phase | Theme | Contains |
|-------|-------|----------|
| **1** | Family Responsibility Manager | Digital Twin · documents · bills · calendar · notifications · responsibilities |
| **2** | Planning | investments · insurance · goals · planning · tax |
| **3** | Automation | automation · AI · simulation · marketplace |
| **4** | Family Operating System | the full OS |

**Product roadmap (5-year arc):** Year 1 Responsibility OS → Year 2 Automation OS → Year 3 Planning
OS → Year 4 Simulation OS → Year 5+ Family Operating System.

The Workflow Catalog's priorities (`02`) map to this: **P0 workflows are the Phase-1 spine.**

## 8. High-level product architecture

```
Mobile / Web  →  API Gateway  →  Planner  →  Policy Engine  →  Workflow Engine
    →  Family Digital Twin  →  Memory  →  AI  →  Connector SDK  →  External Services
```

Detailed elaborations live in the technical specs:
- Entities & events → `01-family-digital-twin-spec.md`
- Workflows → `02-workflow-catalog.md`
- Connectors & consent → `03-connector-registry.md`
- Models, agents, memory, evaluation → `04-ai-architecture-and-assurance.md`

**AI agents:** a single **Planner** coordinating ~12 domain specialists (Investment, Insurance,
Tax, Government, Travel, Healthcare, Education, Legal, Estate, Maintenance, Finance) — not 100 loose
agents. Full treatment in `04 §2.2`.

## 9. India Stack & integration strategy

Saarthi is built on India's digital public infrastructure — Account Aggregator, UPI, BBPS, ABDM,
DigiLocker, FASTag, Passport Seva, EPFO, NPS, GST, Income Tax, UMANG — with future rails ONDC, OCEN,
Bima Sugam. Full registry, consent models, and fallbacks in `03-connector-registry.md`.

## 10. Security & compliance posture

Zero Trust · encryption (field-level for sensitive classes) · **DPDP compliance** · a Consent
Engine (DEPA/AA, ABDM, DigiLocker artifacts) · full audit trail · secrets vault (credentials never
in the graph) · India-region storage for regulated data. Enforced at the data layer (`01 §7`),
connector layer (`03 §8`), and in the AI loop (`04 §5`).

## 11. Business model

Freemium → Premium Family → Embedded Finance → Insurance → Travel → Enterprise → Marketplace →
Developer APIs. Principle 3 governs: **family trust outranks revenue, always** — monetization never
compromises the trust relationship or consent boundaries.

## 12. The broader documentation vision (context)

The long-term intent is a **Product Requirements Bible** (Volumes 0–15: Platform, AI Architecture,
Family Digital Twin, Workflow Engine, Policy Engine, Connector Framework, Knowledge Graph, Memory,
Marketplace, Mobile, Web, Security & Compliance, DevOps, Analytics, Admin Console). This `docs/saarthi/`
set is the **engineering-contract core** of that Bible — the artifacts that had to exist before code.
Additional volumes are elaborated on demand; when they are, they join this folder and the README index.

---

### Open questions / v1.1 candidates
- Formalise the Preparedness Index and Trust Score computation (own spec).
- Business-owner / HUF / NRI variants as first-class scope rather than referenced edge cases.
- Which Bible volumes to elaborate next (Policy Engine and Knowledge Graph are the likely leads).
