# RewardPe — Live Demo Narration Script
### Modules: Brand Workspace (Brands & Tenants) · Dashboard (Portfolio Analytics) · Per‑Tenant Guardrails, Trust & Automation

> **Source build:** `RewardPe-3.1` — refreshed to latest (`b11120e`, 5 Aug 2026).
> **Format:** Word‑for‑word spoken narration for a live product walkthrough.
> **How to read this:** Plain text is what you *say*. `[Bracketed italic text]` are *stage directions* — what to click or point at. Approx. total runtime: **10–12 minutes** (trim the optional callouts for a 6‑minute version).

> **⚠️ What changed since the last build — read before rehearsing:**
> - The standalone **"Platform Console"** page is **gone**. Trust & Anomaly, Automation, and Guardrails now live **inside each brand's own workspace → Settings**, scoped per‑tenant. Module 3 is rewritten to reflect this — it's actually a *stronger* multi‑tenant story now.
> - Navigation is now: **Overview · How It Works · Dashboard · Brand Workspace · Intervention Workspace.**
> - "Portfolio Analytics" is now labelled **"Dashboard"**; "Brands & Tenants" is now **"Brand Workspace"** (and the page header reads **"Brands"**).
> - Terminology shifted from "tenant provisioning" to plain‑English **"brand onboarding"**; isolation now reads **"Isolation: per‑brand."**
> - Brand cards now show a **plan‑cap warning** when a brand's size exceeds its billing tier.

---

## 0 · Opening (≈45 sec)

> *[Start on the Overview / landing page with the RewardPe logo visible.]*

"Thanks everyone. What you're looking at is **RewardPe** — a multi‑tenant, B2B SaaS platform that uses AI to predict when a customer is about to churn, up to **30 days in advance**, and then automatically delivers a personalized reward to win them back *before* they leave.

The thing I want you to keep in mind through this demo is that RewardPe is not a single dashboard — it's an **operator console that runs many brands at once**, and every brand is fully isolated from the next. So I'll walk you through three things: first, the **Brand Workspace**, where we onboard and manage each brand; then the **Dashboard**, where we roll up the money across all of them; and finally I'll take you *inside* a single brand to show the **guardrails, trust, and automation** that govern it — the layer that makes running many brands at once actually safe.

Let's start with the brands themselves."

> *[Click **Brand Workspace** in the top navigation.]*

---

## 1 · Module One — Brand Workspace (Brands & Tenants) (≈3 min)

### 1.1 The brand roster

> *[The "Brands" grid is now on screen.]*

"This is our **brand roster**. Every card here is a completely separate brand running on RewardPe — its own customers, its own data, its own budget, physically isolated from every other brand. You can see the isolation footprint on each card: *Isolation — per‑brand.*

Right now we have two **live** brands and two that are **available** to onboard.

Our first live brand is **StyleKart** — a fashion e‑commerce brand.

> *[Point at the StyleKart card.]*

Notice what each card tells an operator at a glance:
- The **industry** — Fashion E‑commerce.
- The **retention hurdle** — for StyleKart, high cart abandonment on seasonal launches and a drop‑off after the first purchase. This is the actual business problem we're solving for them.
- Their **SaaS subscription tier** — StyleKart is on our **Growth** plan at ₹1,49,999 a month.
- Their **baseline churn rate** — 25%. That's the number we're going to attack.
- And the scale — **132,400 customers** against **₹4.78 crore** in annual revenue.

Below it is **MedPlus**, a pharmacy‑retail brand — 78,500 customers, a **31%** baseline churn, with chronic‑medicine buyers slipping away to local pharmacies. Different industry, different problem, same engine underneath.

Then we have brands ready to be switched on — **CrustCo**, a pizza QSR chain with 34% churn, and **PayNest**, a fintech wallet. For those, the numbers are labelled *pre‑onboarding estimates* — an estimated market size — because we haven't ingested their real data yet."

> *[Optional callout — point at a plan‑cap badge if one is showing.]* "And if a brand's customer base outgrows its billing tier, the card flags it right here — *'exceeds Growth cap — upgrade to Enterprise.'* Billing stays honest automatically."

"Let me show you what onboarding one of these looks like, because this is where the AI actually does its work."

### 1.2 The onboarding wizard

> *[Click **Onboard New Brand** — the "AI‑powered brand onboarding" modal opens on Step 1.]*

"Onboarding is a guided three‑step wizard, and the three steps map exactly to how the platform thinks.

**Step one — Connect Data In.**

> *[Point at the two tabs.]*

I can pick a brand from our ready roster, or **add a brand** from scratch — name, industry, customer footprint, annual GMV, and the retention budget. The moment I set the customer count, notice the platform **auto‑assigns the billing tier** — up to fifty thousand customers is Starter, up to two hundred thousand is Growth, above that is Enterprise. Pricing follows automatically.

> *[Advance to Step 2.]*

**Step two — Connect Actions Out.**

This is where we plug into the brand's existing MarTech stack. RewardPe doesn't replace their tools — it orchestrates them. We pull transaction data from **Shopify**, helpdesk signals from **Zendesk**, engagement from **Klaviyo**, and event streams from **Segment**. All of it flows through a credential tunnel that's **SOC 2 Type II certified** — the tokens are encrypted client‑side.

> *[Advance to Step 3 — the live sync console with the progress ring starts running.]*

**Step three — Set Guardrails, and watch it build.**

This isn't a loading spinner for show. Live, on screen, the engine is spinning up an **isolated brand vault**, ingesting the transaction and helpdesk logs, profiling the seed customer records, and then calculating our core signal — the **Engagement Loyalty Index**, or ELI — for every customer.

> *[Wait for it to hit 100% and the success panel.]*

And it's done — *'Brand onboarded successfully.'* In seconds we've provisioned a sealed brand: every profile scored with **Gradient Boosting**, isolated on **Google Cloud Spanner**, and — this is the important line — customer identities are **hash‑masked under a strict isolation vault**, so no customer list can *physically* leak from one brand to another. That's the guarantee we sell to enterprise clients.

> *[Close the modal, or finalize into the workspace — presenter's choice.]*

So that's how a brand comes onto the platform. Now let's step up a level and look at all of them together — the money view."

> *[Click **Dashboard** in the navigation.]*

---

## 2 · Module Two — Dashboard (Portfolio Analytics) (≈4 min)

### 2.1 The financial rollup

> *[The "Dashboard" view loads. Gesture across the top row of KPI tiles.]*

"This is the **Dashboard** — the cross‑brand financial rollup. If the first screen was for operators, *this* screen is for the person who owns the P&L.

Across the top is the aggregate story for the whole book of business:
- **Customers under management** — the total base we're monitoring across every active brand.
- **Revenue at Risk** — the annual revenue projected to walk out the door from churn. This is the problem, in rupees.
- **Revenue Protected** — the revenue we've *proven* we saved. On average that's a **32% churn reduction**.
- **Incremental Lift** — and I want to stress *incremental*, because this is holdout‑proven, not self‑reported. I'll come back to that.
- **Reward Efficiency** — this is the number that closes deals. It's rupees of revenue protected for every **one rupee** of reward budget spent. It's expressed as a multiple.
- Active interventions running, and the total **SaaS ARR** off the subscription itself."

> *[Optional callout:]* "Notice these are two separate revenue lines — the **software ARR** we bill, and the **customer revenue** we protect. That value‑share story is why the unit economics work."

### 2.2 Drill into a single brand

> *[Point at the "Brand‑wise Performance Ledger" table on the left.]*

"Underneath the aggregate is the brand‑by‑brand ledger — customers, churn percent, revenue at risk, revenue protected, and reward efficiency for each brand, side by side. And it's **interactive** —

> *[Click the StyleKart row.]*

— the moment I click StyleKart, every chart on this page **refocuses onto that one brand**. Watch the gauges on the right.

> *[Point at the two gauges.]*

On the right we now have StyleKart's **Loyalty Health** — the average ELI score across its customers — and the **Churn Danger Zone**, the share of customers sitting in high‑risk territory. And below that, the **customer cohort donut**: every customer is bucketed into one of five behavioral personas — Champions, Loyal, Potential, Needs Attention, and At Risk. This is how a brand manager instantly sees *who* their customers are and *where* the erosion is coming from.

> *[Click the row again, or 'Reset to Portfolio Aggregate'.]*

And I click again to zoom back out to the full portfolio. One click, brand‑level to portfolio‑level and back."

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

Now — everything I've shown you so far is the cross‑brand view. Let me take you *inside* a single brand, because that's where the safety and governance live."

> *[Click **Brand Workspace** → on the StyleKart card click **Open Workspace →**. Then click the **Settings** tab.]*

---

## 3 · Module Three — Inside the Brand: Guardrails, Trust & Automation (≈2.5 min)

### 3.1 Per‑brand guardrails

> *[You're now in StyleKart's workspace, on the **Settings** tab. Point at the settings sub‑tabs.]*

"This is StyleKart's **own workspace**, and I'm on its **Settings**. Everything here is scoped to this one brand — its reward catalog, its scoring pipeline, its guardrails, and its trust and automation. There is no shared 'god view' where one brand's controls bleed into another's; each brand carries its own.

> *[Click the **Tenant Settings & Guardrails** sub‑tab.]*

Start with the **guardrails**. The most important control is the **Brain Operating Mode** — this is how much autonomy the brand grants the AI:
- **Recommend** — the brain proposes every decision, but a human approves each one in the Review queue.
- **Assisted** — low‑value rewards auto‑dispatch under a rupee threshold you set; anything above it waits for a human.
- **Autopilot** — the brain executes everything on its own, strictly within the budget and frequency guardrails.

That's a dial each brand sets for itself. And down here —

> *[Point at the API credentials block.]*

— is the isolation proof, in plain sight: this brand's own **secure workspace token**, its own isolated database credentials. That's the physical boundary behind the promise we made on the onboarding screen."

### 3.2 Trust & anomaly engine — per brand

> *[Click the **Trust & Automation** sub‑tab. Point at the flagged anomalies.]*

"Now the **Trust & Automation** panel. Because we're handing out real money in the form of rewards, people *will* try to abuse it — so an unsupervised **Isolation Forest** model scores every redemption for fraud, and anything above an **80% anomaly score** surfaces here for a human.

And notice — these are **StyleKart's** anomalies only. A customer who claimed **five vouchers in two minutes** from a single IP: velocity spike, 94% anomaly score. Another with **nine redemptions against a single order**: 81%. As the operator I can **Approve** — clear the flag — or **Block** the profile from claiming, and every one of those actions is written to StyleKart's own audit log.

### 3.3 Automation — per brand

> *[Scroll to the **Automation & Sync** block.]*

And below that is the automation layer, again configured *per brand*: the **daily 2 a.m. data sync**, **weekly model retraining** so the churn scores stay accurate as behavior drifts, and the **at‑risk instant trigger** that fires a win‑back the second a customer slips into a risk cohort. Each brand keeps its own schedule. The platform largely runs itself."

### 3.4 The RBAC payoff — persona switch

> *[Point at the persona selector in the top‑right header — the person icon.]*

"And here's how it all stays governed. Watch what happens when I stop being an admin.

> *[Switch persona from **SaaS Super Admin** → **SaaS Retention Analyst**.]*

As a **Retention Analyst**, I can still triage fraud — Approve and Block are live — but look at the automation toggles: they're now **gated**. I can act on risk, but I can't rewrite the brand's schedules.

> *[Switch persona → **SaaS Platform Viewer**.]*

Now I'm a read‑only **Viewer.** *Everything* actionable is gone — Approve, Block, and every toggle replaced with *'Gated — your role.'* Same screen, different authority.

> *[Switch persona → **Brand Manager**.]*

And now I'm a **Brand Manager** — a client logging into their *own* brand. They can manage their own trust and automation, but the moment they touch super‑admin territory — budget allocations, database credentials — they hit a wall: *'Super Admin Level Settings Gated.'* And critically, they can only ever see *their* brand. No other brand exists for them.

That role‑based access control, layered on top of physical per‑brand isolation, is what makes RewardPe safe to sell to a dozen competing brands at the same time."

---

## 4 · Close (≈45 sec)

> *[Exit the workspace and return to the Dashboard or Overview.]*

"So to bring it together — you've seen the whole platform:

- The **Brand Workspace** — how any brand is onboarded in seconds, fully isolated, with its data scored and its churn problem defined.
- The **Dashboard** — how we roll every brand into one financial view, and how we *prove* the revenue we protect with holdout control groups, not guesswork.
- And **inside each brand** — the guardrails, the trust engine, and the automation, each scoped to that one brand and enforced by role‑based access control.

Predict the churn, deliver the reward, prove the lift — across every brand, each one isolated and governed on its own terms, from one console. That's RewardPe.

Happy to dive into any module in more depth, or take questions."

---

## Appendix A · Quick‑reference numbers (for Q&A)

| Brand | Industry | Customers | Annual Revenue | Baseline Churn | Plan |
|---|---|---|---|---|---|
| **StyleKart** | Fashion E‑commerce | 132,400 | ₹4.78 Cr | 25.0% | Growth |
| **MedPlus** | Pharmacy Retail | 78,500 | ₹3.12 Cr | 31.0% | Growth |
| CrustCo *(available)* | QSR / Pizza | 212,000 | ₹5.94 Cr | 34.0% | Growth |
| PayNest *(available)* | Fintech Wallet | 164,000 | ₹8.93 Cr | 18.1% | Growth |

**Plan pricing:** Starter ₹49,999/mo (≤50k customers) · Growth ₹1,49,999/mo (≤200k) · Enterprise ₹4,99,999/mo (200k+). Brands whose size exceeds their tier get a *plan‑cap upgrade* flag on the card.

**Proof point (StyleKart "Festive Flash Winback"):** treated return 71% vs. holdout control 25% → **+46% holdout‑proven incremental lift**, ₹3.31 L revenue protected.

## Appendix B · Glossary (say it right)

- **ELI — Engagement / Emotional Loyalty Index:** a 0–100 health score per customer; the higher it is, the stickier the customer.
- **Churn model:** in‑house classifier (logistic‑regression / gradient boosting) trained on behavioral signals — runs server‑side in microseconds, no external LLM cost.
- **Isolation Forest:** unsupervised anomaly model that flags reward/coupon abuse before it reaches the operator.
- **Holdout / RCT lift:** the difference between a treated group and a randomized control group that got no reward — the *only* lift we claim.
- **Reward Efficiency:** ₹ of revenue protected per ₹1 of reward budget spent (shown as a multiple, e.g. "8.4x").
- **Brain Operating Mode:** per‑brand autonomy dial — **Recommend** (human approves all), **Assisted** (auto under a ₹ threshold), **Autopilot** (fully automated within guardrails).
- **Per‑brand isolation:** each brand's data lives in a strict namespace with hash‑masked identities and its own credentials; no cross‑brand leakage is possible.

## Appendix C · Where things live now (navigation map)

| Nav item | What it is | Key content |
|---|---|---|
| **Overview / How It Works** | Marketing + mechanics | Investor cockpit, core‑engine explainer |
| **Dashboard** | Portfolio Analytics | Cross‑brand KPIs, brand ledger, gauges, cohort donut, RCT proof |
| **Brand Workspace** | Brands roster + onboarding | Brand cards, 3‑step onboarding wizard |
| ↳ *inside a brand →* **Settings** | Per‑brand governance | Reward Catalog · **Tenant Settings & Guardrails** · Cognitive Scoring Pipeline · **Trust & Automation** |
| **Intervention Workspace** | Active retention console | Decision feed & plays for the open brand |

*The old standalone "Platform Console" no longer exists — its Trust, Automation, and Audit functions now live per‑brand under each Brand Workspace → Settings.*

## Appendix D · Personas & permissions (for the RBAC demo)

| Persona | Sees | Trust (Approve/Block) | Automation toggles | Admin settings (budget/credentials) |
|---|---|---|---|---|
| **SaaS Super Admin** | All brands | ✅ | ✅ | ✅ |
| **SaaS Retention Analyst** | All brands | ✅ | ❌ gated | ❌ gated |
| **SaaS Platform Viewer** | All brands | ❌ gated | ❌ gated | ❌ gated |
| **Brand Manager (Client)** | **Own brand only** | ✅ (own brand) | ✅ (own brand) | ❌ "Super Admin Level Settings Gated" |
