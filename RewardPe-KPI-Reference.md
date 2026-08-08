# RewardPe — KPI Reference
### Every metric used across the platform: definition, formula, unit, and where it lives

> **Source of truth:** `RewardPe-3.1`. Formulas below are transcribed from the actual code — `utils/aiPipeline.ts` (customer scoring), `utils/campaignUtils.ts` (intervention outcomes), `utils/brandMetrics.ts` + `utils/dateIntelligence.ts` (brand/budget), `components/PortfolioDashboardView.tsx` (portfolio rollups), `ml/churnModel.ts` (churn classifier).
> **Notation:** `Σ` = sum; rates are 0–100 unless noted; `INR` figures format as ₹.

---

## 1 · Customer‑Level Intelligence KPIs
*Computed per customer by the scoring pipeline (`runPipeline`) at onboarding and on every re‑score.*

| KPI | What it measures | Formula | Range / Unit | Source |
|---|---|---|---|---|
| **ELI — Engagement Loyalty Index** | Overall customer loyalty / health | `min(100, 0.35·(purchase_freq_yr/12·100) + 0.25·engagement_score + 0.20·sentiment_score + 0.20·brand_interaction)` | 0–100 (↑ = healthier) | `aiPipeline.ts` |
| **Churn Probability** | Likelihood the customer leaves | `round(100 · Σ wᵢ·featureᵢ)` over 9 behavioral features (weights below, Σw = 1.0) | 0–100 % | `aiPipeline.ts` |
| **Churn Probability (ML variant)** | Same, via trained classifier | `sigmoid(w·x + b)` — logistic regression over the 9‑feature vector, trained by gradient descent | 0–1 → % | `ml/churnModel.ts` |
| **Responsiveness Score** | How reachable/reward‑reactive the customer is | `min(100, 0.40·email_open_rate + 0.35·reward_redemption_rate + 0.25·(app_sessions_monthly/30·100))` | 0–100; banded High ≥70 / Med / Low <40 | `aiPipeline.ts` |
| **Segment (cohort)** | Behavioral bucket | Rule‑based on ELI + Churn (thresholds below) | Champions / Loyal / Potential / Needs Attention / At Risk | `aiPipeline.ts` |
| **Lifecycle Stage** | Where the customer is in their journey | Rule‑based on churn, tenure, purchase frequency | New / First‑Time / Repeat / Habitual‑Loyal / Advocate / At‑Risk / Churned | `aiPipeline.ts` |
| **Recommended Reward** | Next best incentive for this customer | Best‑fit from the brand's reward catalog, matched to segment/value | reward name + ₹ cost | `rewardUtils.ts` |
| **AOV — Average Order Value** | Per‑brand order value used to price saves | Fixed per brand: StyleKart ₹1,800 · MedPlus ₹1,200 · CrustCo ₹600 · PayNest ₹800 (default ₹1,500) | ₹ | `campaignUtils.ts` |

**Churn feature weights (Σ = 1.00):**

| Feature | Weight | Direction |
|---|---|---|
| days_since_last_purchase (÷120) | 0.22 | ↑ raises churn |
| purchase_frequency_30d (inverse, ÷8) | 0.15 | ↓ raises churn |
| days_since_last_app_open (÷90) | 0.12 | ↑ raises churn |
| app_sessions_monthly (inverse, ÷40) | 0.10 | ↓ raises churn |
| engagement_score (inverse, ÷100) | 0.10 | ↓ raises churn |
| days_since_last_email_open (÷120) | 0.08 | ↑ raises churn |
| email_open_rate (inverse, ÷100) | 0.08 | ↓ raises churn |
| cart_abandonment_rate (÷100) | 0.08 | ↑ raises churn |
| support_tickets (÷6) | 0.07 | ↑ raises churn |

**Segment thresholds:** `At Risk` if churn ≥ 50 · `Champions` if ELI ≥ 70 & churn < 25 · `Loyal` if ELI ≥ 55 & churn < 35 · `Potential` if ELI ≥ 40 & churn < 50 · else `Needs Attention`.

---

## 2 · Intervention / Campaign KPIs
*Per completed or active intervention, measured against a randomized holdout (`getCampaignMetrics`).*

| KPI | What it measures | Formula | Unit | Source |
|---|---|---|---|---|
| **Incentive Spent** | Budget committed to the intervention | `= campaign.budgetAllocated` (settled: `outcomes.budgetUtilized`) | ₹ | `campaignUtils.ts` |
| **Treated Count** | Customers who received the reward | `outcomes.treatedCount` (fallback `budgetAllocated / costPerReward`) | count | `campaignUtils.ts` |
| **Control (Holdout) Count** | Comparable customers given nothing | `outcomes.controlCount` (fallback `≈15% of treated`) | count | `campaignUtils.ts` |
| **Redeemed Count** | Rewards actually redeemed | `min(treatedCount, redeemedCount)` | count | `campaignUtils.ts` |
| **Redemption Rate** | Take‑up of the offered reward | `redeemedCount / treatedCount · 100` | % | `PortfolioDashboardView.tsx` |
| **Treated Return Rate** | % of treated customers who came back | `treatedReturnedCount / treatedCount · 100` | % | `campaignUtils.ts` |
| **Control Return Rate** | % of holdout who came back on their own | `controlReturnedCount / controlCount · 100` | % | `campaignUtils.ts` |
| **Incremental Lift (RCT)** | Causal effect over holdout — *the only claimed value* | `treatedReturnRate − controlReturnRate` | percentage points | `campaignUtils.ts` |
| **Saved Accounts / Conversions** | Customers retained by the intervention | `treatedReturnedCount` (customers returned in treated group) | count | `campaignUtils.ts` |
| **Revenue Protected (campaign)** | ₹ value of incremental saves | `incrementalReturns · AOV`, where `incrementalReturns = treatedReturnedCount − treatedCount·(controlReturnRate/100)` | ₹ | `campaignUtils.ts` |

---

## 3 · Brand & Portfolio Financial KPIs
*Rolled up across a brand's customers, campaigns and budget ledger (`brandMetrics`, `dateIntelligence`), and aggregated to portfolio in the Dashboard.*

| KPI | What it measures | Formula | Unit | Source |
|---|---|---|---|---|
| **Revenue at Risk** | Annual revenue exposed to churn | `annualRevenue · (churnRate / 100)` | ₹/yr | `PortfolioDashboardView.tsx` |
| **Revenue Protected** | Proven revenue saved (settled campaigns) | `Σ completed campaigns' outcomes.revenueProtected` (fallback `revenueAtRisk · 0.24`) | ₹ | `brandMetrics.ts` |
| **Incremental Revenue / Lift (₹)** | Holdout‑proven incremental portion | `revenueProtected · 0.92` | ₹ | `PortfolioDashboardView.tsx` |
| **Reward Efficiency (ROI)** | ₹ protected per ₹1 of reward budget | `revenueProtected / budgetUtilized` | × (multiple) | `brandMetrics.ts` |
| **Blended Reward Efficiency** | Portfolio‑wide efficiency | `Σ revenueProtected / Σ budgetUtilized` (across active brands) | × | `PortfolioDashboardView.tsx` |
| **Average ELI (Loyalty Health)** | Mean customer loyalty for the scope | `mean(customer.eli)` (proxy `100 − churnRate·4` if unscored) | 0–100 | `PortfolioDashboardView.tsx` |
| **At‑Risk % (Churn Danger Zone)** | Share of customers in high‑risk zone | `count(churn ≥ 50) / customers · 100` (proxy `churnRate·1.5`) | % | `PortfolioDashboardView.tsx` |
| **Customers Under Management** | Total addressable base in scope | `Σ brand.customerCount` (active brands) | count | `PortfolioDashboardView.tsx` |
| **Active Interventions** | Live win‑back plays | `count(campaigns where status = active)` | count | `PortfolioDashboardView.tsx` |
| **Total Conversions** | Customers saved across history | `Σ launched campaigns' conversions` | count | `brandMetrics.ts` |
| **MRR — Subscription** | Monthly software revenue | `getPlanPrice(plan)` → Starter ₹49,999 / Growth ₹1,49,999 / Enterprise ₹4,99,999 | ₹/mo | `initialBrands.ts` |
| **ARR — Subscription** | Annual software revenue | `MRR · 12` | ₹/yr | `PortfolioDashboardView.tsx` |

---

## 4 · Budget / Loyalty‑Ledger KPIs
*Per brand, from the budget ledger (`getBudgetStats`).*

| KPI | What it measures | Formula | Unit | Source |
|---|---|---|---|---|
| **Total Budget Pool** | All loyalty capital allocated | `initialBudget + topUps` | ₹ | `dateIntelligence.ts` |
| **Budget Utilized (Spent)** | Settled reward spend | `Σ completed campaigns' outcomes.budgetUtilized` | ₹ | `dateIntelligence.ts` |
| **Reserved Budget** | Committed to live campaigns | `Σ active campaigns' budgetAllocated` | ₹ | `dateIntelligence.ts` |
| **Available Budget** | Spendable balance | `brand.budget` (current ledger balance) | ₹ | `dateIntelligence.ts` |
| **Remaining Budget** | Pool not yet spent/reserved | `max(0, totalBudgetPool − budgetUtilized − reservedBudget)` | ₹ | `dateIntelligence.ts` |
| **Utilization %** | Share of pool spent | `budgetUtilized / totalBudgetPool · 100` | % | `dateIntelligence.ts` |
| **Cap Used %** | Committed vs. pool (spent + reserved) | `(budgetUtilized + reservedBudget) / totalBudgetPool · 100` | % | `brandMetrics.ts` |

---

## 5 · Decision & Trust / Operations KPIs
*From the decision feed (`DecisionFeedTab`) and the trust panel.*

| KPI | What it measures | Formula / Definition | Unit | Source |
|---|---|---|---|---|
| **Pending Approval** | Decisions awaiting a human | `count(decisions where status = PENDING_APPROVAL)` — also the header "Review Decisions" badge | count | `DecisionFeedTab.tsx`, `App.tsx` |
| **Rewards Recommended** | Decisions proposing a reward | `count(decisionType = REWARD_RECOMMENDED)` | count | `DecisionFeedTab.tsx` |
| **Expected Lift (per decision)** | Predicted uplift of the action | model estimate on the decision (e.g. +18.5%) | % | `types.ts` / `DecisionFeedTab.tsx` |
| **Reward Cost (per decision)** | Blended expected ₹ cost of the reward | cost of recommended reward (below face value after redemption) | ₹ | `DecisionFeedTab.tsx` |
| **Decision Type** | The recommended course of action | `REWARD_RECOMMENDED` · `NO_REWARD_NURTURE` · `SUPPRESS_SAVE_BUDGET` | enum | `types.ts` |
| **Decision Outcome** | Result after dispatch | `REDEEMED · IGNORED · RETAINED · PENDING · N/A` | enum | `types.ts` |
| **Anomaly Score** | Fraud/abuse likelihood of a redemption | Unsupervised **Isolation Forest** outlier score; flagged when > 80% | 0–100 % | `BrandWorkspaceView.tsx` (Trust) |
| **Assisted Threshold** | Auto‑execute ceiling in Assisted mode | rewards ≤ `brand.assistedThreshold` auto‑dispatch; above → human review | ₹ | `BrandWorkspaceView.tsx` (Settings) |

---

## 6 · Model‑Quality KPIs *(engineering / diligence)*
*From the churn classifier's held‑out evaluation (`ml/churnModel.ts`).*

| KPI | What it measures | Formula | Unit |
|---|---|---|---|
| **Accuracy** | Correct churn/no‑churn predictions | `correct / samples` on held‑out set | 0–1 |
| **AUC** | Ranking quality of the classifier | area under ROC on held‑out set | 0–1 |
| **Feature Contribution (drivers)** | Why a customer scored as they did | per‑feature `wᵢ·xᵢ`, ranked to surface top drivers | relative |

---

## Quick map — which KPI answers which business question

| Business question | Headline KPI(s) |
|---|---|
| Where are we losing revenue? | **Revenue at Risk**, At‑Risk %, Churn Probability |
| How much have we saved? | **Revenue Protected**, Saved Accounts, Total Conversions |
| Is retention spend efficient? | **Reward Efficiency (× ROI)**, Cap Used %, Utilization % |
| Did the AI actually cause it? | **Incremental Lift (RCT)** = Treated − Control return rate |
| How healthy is the customer base? | **Average ELI**, cohort distribution, Responsiveness |
| What should we do next / is it safe? | Pending Approval, Expected Lift, Anomaly Score, Decision Type |
