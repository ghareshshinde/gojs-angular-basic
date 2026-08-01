# Billing, Subscription & Monetization — v1.0

> Paid features with a free trial, locked after the trial if unpaid, with **autopay scheduled ahead
> of time** (UPI AutoPay / e-NACH / recurring card) based on the monthly or annual plan the customer
> chose. Entitlement is enforced at a **single point**, so feature-gating never sprawls (`06 §2.6`).
> Principle 3 governs throughout: **family trust > revenue** — no dark patterns, clear consent, easy
> cancellation.

Backed by FDT entities `Plan · Membership · Entitlement · PaymentMandate · Invoice/Payment`
(`01 §3.8`). Note these model the family's relationship *with Saarthi* — distinct from the external
`Subscription` entity that tracks Netflix-style third-party subscriptions.

---

## 1. Plans & pricing
- **Tiers:** `Free` (observe-level value, capped), `Premium Family` (full orchestration &
  automation), plus later `Enterprise`/partner tiers (`05 §11`).
- **Billing cycles:** **monthly** and **annual** (annual discounted). Cycle and tier are chosen by
  the customer at signup and stored on `Plan`/`Membership`.
- **Catalog-versioned:** price/feature changes create new `Plan` versions; existing memberships keep
  their agreed terms until renewal (grandfathering) — avoids silent repricing.
- **Region-aware & GST-correct:** prices, currency, and tax computed per region; invoices are
  GST-compliant.

## 2. Membership lifecycle (the state machine)

```
                       ┌───────────── cancel ──────────────┐
                       ▼                                    │
signup → trialing → [trial ending soon] → active → past_due → grace → locked → expired
             │                    │           ▲        │         │        │
      set up autopay        auto-charge on    └── paid ─┘   dunning   reactivate on payment
      (before trial ends)   period start / trial end
```

- **`trialing`** — full (or scoped) access for `trial_length`; no charge yet.
- **`active`** — paid and current; entitlements granted.
- **`past_due`** — a scheduled charge failed; dunning begins, access still on.
- **`grace`** — short buffer after repeated failure; prominent but non-blocking prompts.
- **`locked`** — trial ended without payment, or dunning exhausted → **paid features gated**
  (see §6 for what locking does/doesn't touch).
- **`cancelled`/`expired`** — user-ended or terminal; data retained per `10 §5`.

Events (`01 §3.8`): `TrialStarted, TrialEndingSoon, TrialConverted, TrialExpiredLocked, Renewed,
PaymentFailed, EnteredGrace, MembershipLocked, Cancelled`.

## 3. Autopay scheduled *before* the trial ends (the requested flow)
The goal: a seamless convert-at-trial-end with the customer's explicit up-front authorisation.

1. **At signup / during trial**, the customer picks tier + cycle and is invited (not forced) to
   **set up a `PaymentMandate`**: **UPI AutoPay** (NPCI e-mandate), **e-NACH**, or **recurring
   card** — whichever they choose.
2. The mandate is registered with a **`max_amount` ≥ plan price** and the plan **frequency**, via a
   PCI-scoped payment provider. **We never store the card PAN** — only a provider token (`10 §4`).
3. **A charge is pre-scheduled for the trial-end date** (the scheduling service, `07 §5`). The
   customer sees exactly when and how much they'll be charged.
4. **`TrialEndingSoon`** reminders (T-7/T-3/T-1) tell them it's coming and how to change plan or
   cancel — one tap, no friction.
5. **On trial end:**
   - Mandate active → **auto-charge** on the mandate; success → `active`. Failure → `past_due` →
     dunning (§4).
   - **No mandate set up → `locked`** (paid features gated) until they pay. Access to their own data
     and any free-tier capability remains (§6).

> Autopay is **opt-in and revocable** at any time; revoking simply routes the next renewal back to
> manual. NPCI/RBI e-mandate rules (pre-debit notification, amount caps) are honoured by the mandate
> connectors (`03 §3`).

## 4. Renewals & dunning
- **Renewals** run on `current_period_end` via the same mandate (RBI pre-debit notice sent ahead).
- **Dunning** on failure: retry schedule with backoff, channel escalation (push→SMS→email), clear
  "update payment" CTA; enter `grace` then `locked` only after the sequence is exhausted.
- **Involuntary-churn recovery:** mandate-expiry and card-expiry detection prompt re-authorisation
  before the next cycle.

## 5. Payments & PCI isolation
- All card handling is delegated to a **PCI-DSS-compliant provider**; Saarthi stores **tokens only**,
  keeping card data out of PCI scope (structural decision `06 §2.7`, `10 §4`).
- Money-movement/billing runs as an **isolated service** with its own tightened access and audit.
- UPI AutoPay / e-NACH mandates are set up and debited via the payment connectors (`03 §3`).

## 6. Entitlements & feature-gating (single enforcement point)
- **`Entitlement`** is the resolved answer to "can this family use feature X right now?" — computed
  from `Membership` state and cached on the family.
- **One enforcement point:** the API gateway / policy layer checks entitlement (alongside
  authorisation, `08 §4`) on every gated capability. Feature code **never** branches on `plan == …`
  directly — this is what prevents monetisation logic from sprawling and needing a later rewrite.
- **What locking gates vs preserves:** locking gates *paid orchestration/automation* features.
  It **must not** hold a family's own data hostage — viewing, export/portability (DPDP, `10 §5`),
  security, and consent-revocation always work; in-flight critical safety workflows degrade
  gracefully (notify rather than silently drop). *Family trust > revenue.*
- **Trial/free scoping:** free tier stays at `observe/suggest`; higher automation tiers are a paid
  entitlement — cleanly matching the automation gradient (`02 §6`).

## 7. Related workflows
`WF-FAM-014` Trial start & autopay setup · `WF-FAM-015` Trial-end conversion / lock ·
`WF-FAM-016` Plan change (upgrade/downgrade, proration) · `WF-FAM-017` Payment-failure dunning &
recovery · `WF-FAM-018` Cancellation & win-back (see `02 §4.12`).

---

### Open questions / v1.1 candidates
- Per-seat vs per-family pricing; add-on/marketplace revenue share (Bible Vol 9).
- Regional pricing & purchasing-power parity within India.
- Refund/pro-ration policy and free-look-style cooling-off for annual plans.
