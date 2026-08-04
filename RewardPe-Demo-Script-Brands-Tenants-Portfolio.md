# RewardPe — Live Demo Narration Script
### Modules: Brands & Tenants · Portfolio Analytics · Platform Console (Multi‑Tenant Governance)

> **Source build:** `RewardPe-3.1`
> **Format:** Word‑for‑word spoken narration for a live product walkthrough.
> **How to read this:** Plain text is what you *say*. `[Bracketed italic text]` are *stage directions* — what to click or point at. Approx. total runtime: **10–12 minutes** (trim the optional callouts for a 6‑minute version).

---

## 0 · Opening (≈45 sec)

> *[Start on the Overview / landing page with the RewardPe logo visible.]*

"Thanks everyone. What you're looking at is **RewardPe** — a multi‑tenant, B2B SaaS platform that uses AI to predict when a customer is about to churn, up to **30 days in advance**, and then automatically delivers a personalized reward to win them back *before* they leave.

The thing I want you to keep in mind through this demo is that RewardPe is not a single dashboard — it's an **operator console that runs many brands at once**, each fully isolated from the other. So I'm going to walk you through three parts of the platform: first, **Brands & Tenants**, where we onboard and manage each customer brand; then **Portfolio Analytics**, where we roll up the money across all of them; and finally the **Platform Console**, which is the multi‑tenant governance and trust layer that keeps all of this safe and compliant.

Let's start with the tenants themselves."

> *[Click **Brands & Tenants** in the top navigation.]*

---

## 1 · Module One — Brands & Tenants (≈3 min)

### 1.1 The tenant roster

> *[The "Enterprise Portfolios" grid is now on screen.]*

"This is our **tenant roster**. Every card here is a completely separate brand running on RewardPe — its own customers, its own data, its own budget, physically isolated from every other tenant. You can see the isolation badge on each card: *Isolation Level — Brand Tenant.*

Right now we have two **live** tenants and two that are **available** to onboard.

Our first active tenant is **StyleKart** — a fashion e‑commerce brand.

> *[Point at the StyleKart card.]*

Notice what each card tells an operator at a glance:
- The **industry** — Fashion E‑commerce.
- The **retention hurdle** — in StyleKart's case, high cart abandonment on seasonal launches and a drop‑off after the first purchase. This is the actual business problem we're solving for them.
- Their **SaaS subscription tier** — StyleKart is on our **Growth** plan at ₹1,49,999 a month.
- Their **baseline churn rate** — 25%. That's the number we're going to attack.
- And the scale — **132,400 customers** against **₹4.78 crore** in annual revenue.

Below it is **MedPlus**, a pharmacy‑retail tenant — 78,500 customers, a **31%** baseline churn, with chronic‑medicine buyers slipping away to local pharmacies. Different industry, different problem, same engine underneath.

And then we have brands ready to be switched on — **CrustCo**, a pizza QSR chain with 34% churn, and **PayNest**, a fintech wallet. Let me show you exactly what onboarding one of these looks like, because this is where the AI provisioning happens."

### 1.2 The onboarding wizard

> *[Click **Onboard New Brand** — the "AI‑Powered Tenant Provisioning" modal opens on Step 1.]*

"Onboarding is a guided three‑step wizard, and the three steps map exactly to how the platform thinks.

**Step one — Connect Data In.**

> *[Point at the two tabs.]*

I can pick a brand from our ready roster, or provision a completely custom tenant — name, industry, customer footprint, annual GMV, and the retention budget. The moment I set the customer count, notice the platform **auto‑assigns the billing tier** — under fifty thousand customers is Starter, up to two hundred thousand is Growth, above that is Enterprise. Pricing follows automatically.

> *[Advance to Step 2.]*

**Step two — Connect Actions Out.**

This is where we plug into the brand's existing MarTech stack. RewardPe doesn't replace their tools — it orchestrates them. We pull transaction data from **Shopify**, helpdesk signals from **Zendesk**, engagement from **Klaviyo**, and event streams from **Segment**. All of it flows through a credential tunnel that's **SOC 2 Type II certified** — the tokens are encrypted client‑side.

> *[Advance to Step 3 — the live sync console with the progress ring starts running.]*

**Step three — Set Guardrails, and watch it build.**

This isn't a loading spinner for show. Live, on screen, the engine is spinning up an **isolated tenant vault**, ingesting the transaction and helpdesk logs, profiling the seed customer records, and then calculating our core signal — the **Engagement Loyalty Index**, or ELI — for every customer.

> *[Wait for it to hit 100% and the success panel.]*

And it's done. In seconds we've provisioned a sealed tenant: every profile scored with **Gradient Boosting**, isolated on **Google Cloud Spanner**, and — this is the important line — customer identities are **hash‑masked under tenant isolation**, so no customer list can *physically* leak from one brand to another. That's the guarantee we sell to enterprise clients.

> *[Close the modal without finalizing, or finalize into the workspace — presenter's choice.]*

So that's how a brand comes onto the platform. Now let's step up a level and look at all of them together — the money view."

> *[Click **Portfolio Analytics** in the navigation.]*

---

## 2 · Module Two — Portfolio Analytics (≈4 min)

### 2.1 The financial rollup

> *[The "Portfolio Financials" view loads. Gesture across the top row of KPI tiles.]*

"This is **Portfolio Analytics** — the cross‑brand financial rollup. If the first screen was for operators, *this* screen is for the person who owns the P&L.

Across the top is the aggregate story for the whole book of business:
- **Customers under management** — the total base we're monitoring across every active tenant.
- **Revenue at Risk** — the annual revenue projected to walk out the door from churn. This is the problem, in rupees.
- **Revenue Protected** — the revenue we've *proven* we saved. On average that's a **32% churn reduction**.
- **Incremental Lift** — and I want to stress *incremental*, because this is holdout‑proven, not self‑reported. I'll come back to that.
- **Reward Efficiency** — this is the number that closes deals. It's rupees of revenue protected for every **one rupee** of reward budget spent. It's expressed as a multiple.
- Active interventions running, and the total **SaaS ARR** off the subscription itself."

> *[Optional callout:]* "Notice these are two separate revenue lines — the **software ARR** we bill, and the **customer revenue** we protect. That value‑share story is why the unit economics work."

### 2.2 Drill into a single brand

> *[Point at the "Brand‑wise Performance Ledger" table on the left.]*

"Underneath the aggregate is the brand‑by‑brand ledger — customers, churn percent, revenue at risk, revenue protected, and reward efficiency for each tenant, side by side. And it's **interactive** —

> *[Click the StyleKart row.]*

— the moment I click StyleKart, every chart on this page **refocuses onto that one tenant**. Watch the gauges on the right.

> *[Point at the two gauges.]*

On the right we now have StyleKart's **Loyalty Health** — the average ELI score across its customers — and the **Churn Danger Zone**, the share of customers sitting in high‑risk territory. And below that, the **customer cohort donut**: every customer is bucketed into one of five behavioral personas — Champions, Loyal, Potential, Needs Attention, and At Risk. This is how a brand manager instantly sees *who* their customers are and *where* the erosion is coming from.

> *[Click the row again, or 'Reset to Portfolio Aggregate'.]*

And I click again to zoom back out to the full portfolio. One click, tenant‑level to portfolio‑level and back."

### 2.3 The proof — holdout RCT

> *[Scroll down to the "Intervention History & Performance" table.]*

"Now, this is my favorite part, because this is where RewardPe defends its numbers. Every intervention we've run — active, completed, or draft — is logged here with its lift, its saved accounts, and the revenue it protected. Let me open a completed one.

> *[Click a completed campaign row — e.g. StyleKart's "Festive Flash Winback" — to expand the detail panel.]*

Here's the receipt. When we ran this win‑back, we didn't just send everyone a reward and take credit. We held back a **randomized control group** — a holdout — that got *nothing*. And we compare:
- The **treated group** came back at a **71%** return rate.
- The **holdout control group** came back at just **25%** on its own.

The difference between those two — the **holdout‑proven incremental lift** — is the *only* number we claim credit for. That's real, defensible, board‑grade attribution. Not 'we emailed people and some came back' — actual causal proof that RewardPe moved the needle.

> *[Scroll to the bottom‑line synthesis card.]*

And it all ladders up to this one‑line synthesis at the bottom: right now the RewardPe engine is monitoring our entire subscriber base across StyleKart and MedPlus, protecting real annual revenue from silent churn, at a proven reward efficiency. Live, and always on.

Now — everything I've shown you assumes I'm a super‑admin who can see everything. Let me show you what keeps that safe."

> *[Click **Platform Console** in the navigation.]*

---

## 3 · Module Three — Platform Console: Multi‑Tenant Governance (≈2.5 min)

### 3.1 Trust & anomaly engine

> *[The "Platform Back Office" loads on the Trust & Anomaly tab. Point at the role badge, top right.]*

"This is the **Platform Console** — the governance and trust layer that makes running many tenants at once actually safe. Notice the role badge up here: I'm operating as **Super Admin**.

The first tab is our **Trust & Anomaly Engine**. Because we're handing out real money in the form of rewards, people *will* try to abuse it. So an unsupervised **Isolation Forest** model scores every redemption for fraud in real time, and anything above an **80% anomaly score** surfaces here for a human.

> *[Point at the flagged anomaly cards.]*

Look at these — a customer on StyleKart who claimed **five vouchers in two minutes** from a single IP: velocity spike, 94% anomaly score. A MedPlus customer redeeming premium health vouchers **with zero orders behind them.** As the operator I can **Approve** — clear the flag — or **Block** the profile from claiming, and every one of those actions is written to an immutable log.

### 3.2 Cross‑tenant audit & RBAC

> *[Click the **Cross‑Tenant Audit Trail** tab.]*

This is that immutable **audit trail** — every pipeline action, every message generated, every reward prescribed, every operator decision, across all tenants, filterable by brand and outcome. This is what an enterprise security review or a compliance auditor asks for on day one.

> *[Click the **Automation & Sync Scheduler** tab.]*

And this is the automation layer — the **daily 2 a.m. sync**, **weekly model retraining** so the churn scores stay accurate as behavior drifts, and the **at‑risk instant trigger** that fires a win‑back the second a customer slips into a risk cohort. The platform largely runs itself."

### 3.3 The RBAC payoff — persona switch

> *[Point at the persona selector in the top‑right header — the person icon.]*

"And here's how it all stays governed. Watch what happens when I stop being an admin.

> *[Switch persona from Super Admin → Platform Viewer.]*

I'm now a **read‑only Viewer.** Look — the Approve and Block buttons are **gone**, replaced with *'Gated — this role lacks authority.'* The scheduler toggles are locked. Same screen, different authority.

> *[Switch persona → Brand Manager (client).]*

And now I'm a **Brand Manager** — a client logging into their *own* tenant. The cross‑tenant audit tab **disappears entirely.** They can only ever see StyleKart's own anomalies, in StyleKart's own namespace. This is the multi‑tenant isolation we promised on the onboarding screen, enforced at the UI layer, the data layer, and the access‑control layer simultaneously.

That role‑based access control, on top of physical tenant isolation, is what makes RewardPe safe to sell to a dozen competing brands at the same time."

---

## 4 · Close (≈45 sec)

> *[Return to Portfolio Analytics or the Overview page.]*

"So to bring it together — in three screens you've seen the whole platform:

- **Brands & Tenants** — how any brand is onboarded in seconds, fully isolated, with its data scored and its churn problem defined.
- **Portfolio Analytics** — how we roll every tenant into one financial view, and how we *prove* the revenue we protect with holdout control groups, not guesswork.
- And the **Platform Console** — the trust, audit, and role‑based governance that lets one operator safely run many brands at once.

Predict the churn, deliver the reward, prove the lift — across every tenant, from one console. That's RewardPe.

Happy to dive into any module in more depth, or take questions."

---

## Appendix A · Quick‑reference numbers (for Q&A)

| Tenant | Industry | Customers | Annual Revenue | Baseline Churn | Plan |
|---|---|---|---|---|---|
| **StyleKart** | Fashion E‑commerce | 132,400 | ₹4.78 Cr | 25.0% | Growth |
| **MedPlus** | Pharmacy Retail | 78,500 | ₹3.12 Cr | 31.0% | Growth |
| CrustCo *(available)* | QSR / Pizza | 212,000 | ₹5.94 Cr | 34.0% | Growth |
| PayNest *(available)* | Fintech Wallet | 164,000 | ₹8.93 Cr | 18.1% | Growth |

**Plan pricing:** Starter ₹49,999/mo (≤50k customers) · Growth ₹1,49,999/mo (≤200k) · Enterprise ₹4,99,999/mo (200k+)

**Proof point (StyleKart "Festive Flash Winback"):** treated return 71% vs. holdout control 25% → **+46% holdout‑proven incremental lift**, ₹3.31 L revenue protected.

## Appendix B · Glossary (say it right)

- **ELI — Engagement / Emotional Loyalty Index:** a 0–100 health score per customer; the higher it is, the stickier the customer.
- **Churn model:** in‑house classifier (logistic‑regression / gradient boosting) trained on behavioral signals — runs server‑side in microseconds, no external LLM cost.
- **Isolation Forest:** unsupervised anomaly model that flags reward/coupon abuse before it reaches the operator.
- **Holdout / RCT lift:** the difference between a treated group and a randomized control group that got no reward — the *only* lift we claim.
- **Reward Efficiency:** ₹ of revenue protected per ₹1 of reward budget spent (shown as a multiple, e.g. "8.4x").
- **Tenant isolation:** each brand's data lives in a strict namespace with hash‑masked identities; no cross‑brand leakage is possible.

## Appendix C · Personas you can demo

| Persona | Sees | Can do |
|---|---|---|
| **SaaS Super Admin** | Everything, all tenants | Approve/Block anomalies, toggle schedulers, full audit |
| **SaaS Retention Analyst** | All tenants | Intervene on anomalies; scheduler config **gated** |
| **SaaS Platform Viewer** | All tenants | **Read‑only** — all actions gated |
| **Brand Manager (Client)** | **Own tenant only** | Own‑brand actions; cross‑tenant audit **hidden** |
