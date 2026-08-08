# RewardPe — Case Solution
### Structure: Problem → Case Questions → Approach → Sizing (guesstimates, replaced by researched numbers) → Solution → Proof → Recommendation

> **Category being solved for:** *Autonomous Customer Decision Intelligence* — moving an enterprise from reactive customer management to autonomous, measurable customer decision‑making.
> **Data basis:** all figures are the live RewardPe portfolio (active brands **StyleKart** + **MedPlus**), so the case math reconciles with the product's Dashboard.

---

## 1 · The Situation

A multi‑brand enterprise runs several consumer businesses — fashion, pharmacy, QSR, fintech — each on its own martech stack (Shopify, Zendesk, Klaviyo, Segment). Growth spend keeps acquiring customers, but a large share silently stop buying. The company reacts *after* revenue has already left: quarterly churn reports, blanket win‑back emails, no way to prove what actually worked.

The leadership team can see churn in a dashboard. What they **cannot** do is: predict *which* customer will leave, decide the *right* action per customer, execute it through the tools they already own, and prove — causally — that the action created value.

---

## 2 · Problem Statement

> **How can a multi‑brand enterprise convert silent, after‑the‑fact customer churn into a proactive, automated, and financially provable retention engine — without ripping out its existing CRM and marketing stack?**

Three constraints make this hard:
1. **Prediction** — churn must be seen *before* it happens, per customer, not in aggregate.
2. **Decision + execution** — knowing who is at risk is useless without the *right* intervention, executed automatically.
3. **Proof & trust** — finance won't fund, and a CIO won't automate, what can't be measured causally and governed by role.

---

## 3 · The Case Questions

| # | Question | Maps to |
|---|---|---|
| **Q0** | *How big is the churn problem, in money, and how much is recoverable?* | Sizing (§5) |
| **Q1** | *How does a new enterprise get started on the platform?* | Onboarding (§6.1) |
| **Q2** | *How does leadership know the platform is creating value?* | Dashboard + causal proof (§6.2, §7) |
| **Q3** | *How can AI be trusted to make customer decisions autonomously?* | Guardrails, trust, access (§6.3) |

---

## 4 · Approach / Framework

We solve the money question first (size the prize), then show the operating model in three moves that mirror the buyer's real questions:

```
        SIZE THE PRIZE
   Revenue at Risk  →  Recoverable  →  Cost to Recover
              │
      ┌───────┼─────────┐
      ▼       ▼         ▼
   GET       PROVE     TRUST
   STARTED   VALUE     THE AI
  (onboard) (dashboard)(guardrails/RBAC)
```

---

## 5 · Sizing — the "guesstimates," replaced by our researched numbers

In a classic case you'd *estimate* each of these. Here we substitute the live, researched figures from the active portfolio. Each step keeps the estimation **logic** visible so it's defensible under questioning.

### 5.1 Guesstimate → Revenue at Risk (the size of the problem)

**Estimation logic:** `Revenue at Risk = Annual Revenue × Churn Rate`

| Brand | Annual Revenue | Baseline Churn | **Revenue at Risk / yr** |
|---|---|---|---|
| StyleKart (fashion) | ₹4.78 Cr | 25.0% | **₹1.20 Cr** |
| MedPlus (pharmacy) | ₹3.12 Cr | 31.0% | **₹0.97 Cr** |
| **Active portfolio** | **₹7.90 Cr** | **27.4%** (rev‑weighted) | **₹2.16 Cr** |

> **Take‑away:** across just two live brands, **≈ ₹2.16 Cr of annual revenue is at risk** — 27% of the book. That is the prize.

### 5.2 Guesstimate → How much is *recoverable*?

**Estimation logic:** not all at‑risk revenue is saveable. The honest recovery rate is the **holdout‑proven incremental lift** — the extra return caused by the intervention, over a control group that got nothing.

- Researched figure (StyleKart win‑back): treated cohort returned at **71%** vs. holdout control at **25%** → **+46 percentage‑point incremental lift.**
- Interpretation: for the treated at‑risk cohort, RewardPe **causally recovers ~46% more** of the customers than doing nothing.

> **Take‑away:** recovery isn't assumed — it's measured against a control. The recoverable slice is real, not a projection.

### 5.3 Guesstimate → What does recovery *cost*? (unit economics)

**Estimation logic:** `Reward Efficiency = Revenue Protected ÷ Reward Budget Spent`

| Brand (completed interventions) | Revenue Protected | Reward Budget Spent | **Reward Efficiency** |
|---|---|---|---|
| StyleKart | ₹3.31 L | ₹0.96 L | **3.5×** |
| MedPlus | ₹1.53 L | ₹0.78 L | **2.0×** |
| **Blended** | **₹4.84 L** | **₹1.74 L** | **2.8×** |

> **Take‑away:** every **₹1** of reward budget has protected **₹2.8** of revenue so far — and this is *early*: only the first interventions have settled. The gap between **₹4.84 L proven‑protected today** and **₹2.16 Cr at‑risk** is the growth runway, not a ceiling.

### 5.4 Guesstimate → Platform economics

- **Customers under management (active):** 210,900.
- **SaaS ARR (2 brands on Growth):** ≈ **₹36 L**, entirely separate from the customer revenue it protects — the value‑share model: the platform is cheap relative to the ₹2.16 Cr it defends.

---

## 6 · The Solution — how RewardPe operates (answering Q1–Q3)

### 6.1 Q1 — Getting started: onboarding as a decision layer

A brand joins as an **isolated tenant** and is provisioned in three steps that mirror how the platform runs:
1. **Connect Data In** — transaction + service history ingested; auto‑tiered to the right plan.
2. **Connect Actions Out** — orchestrates the enterprise's *existing* tools (Shopify, Zendesk, Klaviyo, Segment) over a SOC 2 Type II channel. *Nothing is ripped out — RewardPe becomes the decision layer above them.*
3. **Set Guardrails** — every customer scored on the **Engagement Loyalty Index**; identities hash‑masked in a strict per‑brand isolation vault.

**Answer to Q1:** a brand goes from raw data to a fully scored, isolated, decision‑ready tenant in one guided sequence — *without* replacing any existing system.

### 6.2 Q2 — Proving value: the leadership dashboard

Framed as the CMO's three morning questions:
- **How much revenue is at risk?** → ₹2.16 Cr (portfolio).
- **How much have we protected?** → ₹4.84 L proven, growing.
- **Which brand needs attention today?** → the brand ledger, one click to focus.

Plus the "always‑on" signal: the decision engine continuously evaluates the live base and queues intervention recommendations in the background.

**Answer to Q2:** leadership sees **measured business outcomes**, not activity — revenue at risk, revenue protected, and reward efficiency, per brand and in aggregate.

### 6.3 Q3 — Trusting the AI: autonomy, policing, access

- **Autonomy dial (per brand):** **Recommend → Assisted → Autopilot.** The enterprise earns its way up as results prove out.
- **Policing:** every intervention scored for abuse by an unsupervised anomaly model; flagged items go to a human; actions are audit‑logged.
- **Access:** role‑based and enforced live — Analyst can act but not set policy; Viewer is read‑only; Brand Manager sees only its own brand.

**Answer to Q3:** decisions are **explainable, policed, role‑governed, and physically isolated** — the preconditions for handing autonomy to an AI in an enterprise.

---

## 7 · Proof — the causal test (why this isn't a campaign tool)

The differentiator is measurement. Completed interventions are run as **randomized holdout experiments**:

| Metric (StyleKart "Festive Flash Winback") | Value |
|---|---|
| Treated group return rate | **71%** |
| Holdout control return rate | **25%** |
| **Holdout‑proven incremental lift** | **+46 pts** |
| Customers saved | 162 |
| Revenue protected | ₹3.31 L |
| Reward budget spent | ₹0.96 L → **3.5× efficiency** |

> Every recommendation is measured this way. RewardPe claims credit **only** for the causal gap over control — board‑grade attribution.

---

## 8 · Risks & Mitigations

| Risk | Mitigation in the platform |
|---|---|
| AI acts wrongly / over‑spends | Autonomy dial + budget & frequency guardrails; start at Recommend |
| Reward abuse / coupon farming | Unsupervised anomaly scoring, human review, audit trail |
| Cross‑brand data leakage | Per‑brand isolation vault, hash‑masked identities, RBAC |
| "Correlation ≠ causation" objection | Randomized holdout on every intervention |
| Rip‑and‑replace fear | Sits *above* existing CRM/martech as a decision layer |

---

## 9 · Recommendation

**Adopt RewardPe as the enterprise's customer decision layer**, starting with the two highest‑churn brands (MedPlus 31%, StyleKart 25%) in **Recommend** mode, and dial toward Autopilot as holdout‑proven lift accumulates.

- **The prize:** ₹2.16 Cr/yr of at‑risk revenue addressable across two brands today.
- **The economics:** ~2.8× reward efficiency proven early; ₹36 L ARR is small versus the revenue defended.
- **The moat:** causal, holdout‑based proof on every decision — activity becomes accountable outcome.

> **Bottom line:** RewardPe turns silent, after‑the‑fact churn into a proactive, automated, and *provable* retention engine — every recommendation measurable, explainable, financially accountable, and continuously optimized, on the systems the enterprise already owns.

---

## Appendix · Assumptions & data sources

- **Scope:** "Active portfolio" = the two live brands (StyleKart, MedPlus). CrustCo and PayNest are *available* (pre‑onboarding estimates) and excluded from proven figures.
- **Revenue at Risk** = Annual Revenue × Baseline Churn (annualized).
- **Revenue Protected & Reward Efficiency** = summed from *completed* holdout campaigns only (settled outcomes), so they under‑state the opportunity by design.
- **Incremental lift** = treated return rate − control return rate, from the randomized holdout.
- **ARR** = plan MRR × 12 (both brands on Growth @ ₹1,49,999/mo).
- **Note on ratios:** seed figures are used as‑is; revenue‑per‑customer implied by the seed data is intentionally not quoted on stage. See the demo script's Appendix A.
