# v0 — Gmail "Actionable Inbox" (the first buildable slice) — v1.0

> The whole of `01`–`10` is the destination. **This is where we start.** v0 is the absolute-basic,
> single-connector slice that makes one person's life easier today: read their Gmail, surface the
> handful of things that actually need action, and hide the thousands that don't. It is a thin
> vertical slice through the real architecture — the `email_ingest` connector (`03 §6A`), a minimal
> Family Digital Twin, and suggest-tier AI (`04`) — so nothing built here is thrown away.

Scope chosen with the user: **v0 outcome = an "important & actionable inbox."** Grounded in a
read-only exploration of a real inbox (findings below), not assumptions.

---

## 1. Findings from the real inbox (what grounded this scope)

A read-only exploration (July 2026) of the target Gmail account showed:

- **Overload is the core problem:** ~6,970 inbox threads, ~14,000 unread, almost no labels. The
  dominant volume is **job alerts / recruiters** (LinkedIn, Glassdoor, Naukri, hirist, aiapply) and
  **newsletters / promotions**.
- **Real "actions" are few and clustered.** On this account they are almost entirely:
  1. **Recurring SaaS subscriptions auto-renewing** (e.g. a Stripe subscription renewing the 14th
     each month) — money-leak review candidates.
  2. **Trials ending / "add payment or downgrade"** (learning platforms, productivity SaaS) — a
     dated decision.
  3. **Failed / pending payments** (a Stripe charge that didn't go through).
  4. **Deadlines** (course quizzes, certificate windows).
- **Absent on this account:** banking, insurance, government, and travel mail (`category:reservations`
  empty; no bank/RTA/income-tax senders). The family-OS finance lanes aren't exercised here — so v0
  must deliver value from what's present *and* generalise to those lanes when they appear.

### Three design lessons (these are load-bearing)
1. **Classify by sender + Gmail category, not keywords.** A keyword search for
   "insurance/policy/premium" returned ~100% job spam (the user is a fintech/insurance PM). Sender
   domain and Gmail's native `category:purchases` / `reservations` were dramatically cleaner.
2. **Dedup is mandatory.** The same event arrives 5+ times (identical trial reminders; monthly
   renewal notices). v0 collapses repeats into one action.
3. **De-noising is the product.** Surfacing ~10 real actions out of thousands *is* the value.

---

## 2. v0 definition

**A read-only Gmail processor that turns an overloaded inbox into a short, ranked list of things
that actually need the user, and stays quiet about everything else.**

- **Read-only. Suggest-only.** v0 never sends, replies, labels-to-act, pays, or modifies anything.
  It observes and recommends — the `observe`/`suggest` tiers of the automation gradient (`02 §6`).
- **Single user.** No family, no multi-tenant surface yet (the code still keys everything by a
  user id so multi-tenancy is not retrofitted later — `06 §2.2`).
- **One connector:** Gmail read (`email_ingest`).

## 3. Actionable lanes (v0 taxonomy)

A small, closed set — each item is classified into exactly one, or dropped as noise.

| Lane | What it catches | Example signal | The action |
|------|-----------------|----------------|-----------|
| **Renewals & subscriptions** | recurring paid services auto-renewing | "subscription will renew on <date>" (Stripe/vendor) | review · keep · cancel |
| **Trials ending** | free trial converting or lapsing | "trial ends <date>", "add payment or downgrade" | decide before date |
| **Failed / pending payment** | a charge that failed or needs action | "payment unsuccessful", "couldn't charge card" | fix or dismiss |
| **Deadlines** | dated obligations | course quiz due, certificate window, "last date" | do by date |
| **Bills & dues** *(generalises)* | utility/card/loan dues | biller/bank statement "amount due <date>" | pay/review |
| **Money movement (info)** | payments received / debited | "payment received", "debited" | none — net-worth signal |
| *(future lanes)* | insurance renewal, gov/identity expiry, travel | insurer/gov/airline senders | route to the real workflows |

Everything else → **suppressed** (job alerts, recruiter outreach, newsletters, promotions, social).
An optional **Job-applications digest** lane is available but off by default (this inbox is
job-hunt-heavy; some users will want it, most won't).

## 4. Classification approach

1. **Fetch** recent mail read-only (windowed, e.g. last 90–180 days first, then incremental).
2. **Route by strong signals first:** sender domain + Gmail `category:` + known-sender rules
   (a curated map: Stripe/vendor billing domains → subscription/payment; learning platforms →
   deadline/trial; job domains → suppress).
3. **Then light content cues** (subject/snippet) only to refine, never as the sole basis.
4. **Extract** a small structured record per actionable item (§5), with a **confidence** score.
5. **Dedup** by `(service, lane, event-key)` — collapse the 5 identical reminders into one, keeping
   the latest and the earliest-seen date.
6. **Rank** by urgency (due date proximity × amount × criticality) and present.
7. **Low confidence → show in a "review" bucket**, never dropped silently, never auto-acted.

## 5. Minimal data model (subset of the real FDT)

v0 persists a thin slice of `01` — enough to be useful, shaped so it grows into the full Twin.

```jsonc
IngestedMessage { id, source:"email", sender, subject, snippet, received_at, gmail_thread_id,
                  category, lane, confidence, extracted{}, suppressed:bool }   // 01 §3.9
ActionItem      { id, lane, title, service/merchant, amount?, currency?, due_date?,
                  status:"open|snoozed|done|dismissed", source_message_ids[], first_seen, urgency } // ~Responsibility (01 §3.7)
```

`ActionItem` is a v0 stand-in for `Responsibility`; `IngestedMessage` is exactly the FDT entity.
No secrets are stored; OAuth tokens live in a vault/secret store, never in this data (`10 §4`).

## 6. Architecture mapping (thin slice, no throwaway)

| Real subsystem | v0 realisation |
|----------------|----------------|
| `email_ingest` connector (`03 §6A`) | Gmail read-only via OAuth (restricted scope) |
| Family Digital Twin (`01`) | minimal store: `IngestedMessage` + `ActionItem`, keyed by user id |
| Workflow: email discovery + triage (`WF-FIN-022`, `WF-FAM-006`) | the classify→dedup→rank pipeline |
| AI Assurance (`04`) | classifier emits typed output + confidence; suggest-only; low-conf → review; **content treated as untrusted** (no acting on instructions inside emails) |
| Identity/Access (`08`) | single user; token in secret store |
| Security/Privacy (`10 §3`) | read-only, minimal retention (store extracted facts + refs, not whole mailbox), **no OTP capture**, purpose-bound |

## 7. Explicitly out of scope for v0
Sending/modifying email · money movement or autopay · family/multi-user · connectors beyond Gmail ·
SMS · mobile app · net-worth aggregation · any autonomous action. These are later slices, already
specified in `01`–`10`.

## 8. Success criteria (how we know v0 works)
- From a cold inbox, v0 surfaces the true action items (renewals, trials-ending, failed payments,
  deadlines) with **high precision** (few false "actions") and dedups repeats to one.
- The user can see, at a glance, "what needs me and by when" — and the thousands of job/newsletter
  mails are silent.
- Measured on a small **golden set** of hand-labeled threads (the `04 §4` discipline, in miniature):
  precision/recall per lane, dedup correctness.

## 9. Build plan (next step after this scope is confirmed)
1. Gmail read-only OAuth + fetch (windowed + incremental).
2. Sender/category rules map + classifier with confidence; dedup; rank.
3. Minimal store + a simple "Actionable Inbox" view (one ranked list, grouped by lane, with
   snooze/dismiss/done).
4. Golden-set eval harness for precision/recall + dedup.
5. Iterate rules on real mail; then consider adding SMS and the finance lanes.

---

### Open questions / v1.1 candidates
- Include the optional **Job-applications digest** lane by default, or keep off?
- On-device vs server processing for privacy (matters more once SMS/bank mail is added).
- When to introduce the first *write* action (e.g. one-tap "cancel this subscription" guidance) —
  crosses from `suggest` into `assist`.
