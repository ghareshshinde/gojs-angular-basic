# Saarthi v0 — Gmail "Actionable Inbox"

The first buildable slice of Saarthi (see [`docs/saarthi/11-v0-gmail-actionable-inbox.md`](../../docs/saarthi/11-v0-gmail-actionable-inbox.md)).

**What it does:** reads email, classifies each message into a small set of *action lanes*
(payment-failed · trial-ending · deadline · renewal · bill), **dedups** the repeats, **ranks** by
urgency, and shows you the handful that need action — hiding the thousands that don't
(job alerts, newsletters, promotions).

Read-only. Suggest-only. Single user. It never sends, modifies, labels, or pays.

## Run it (offline, zero dependencies)

Requires Node ≥ 22.18 (runs TypeScript natively — no build step, no `npm install`).

```bash
cd apps/v0-actionable-inbox
npm run demo          # classify the bundled sample inbox → console + out/actionable-inbox.html
npm run demo -- --jobs   # also surface the (off-by-default) job-applications lane
npm test              # golden-set eval: per-lane precision/recall + dedup check
```

The sample inbox in `fixtures/emails.sample.json` mirrors real-inbox patterns (recurring SaaS
renewals, trials ending, a failed charge, a course deadline, plus job/newsletter noise).

## What you'll see

```
▶ NEEDS YOU (ranked):
  [130] TRIAL ENDING: Coursera trial ending — add payment or lose it   ⏰ 2026-07-09  (×5 collapsed)
  [130] TRIAL ENDING: Atlassian/Loom trial ending — add payment or lose it  ⏰ 2026-07-07  (×4 collapsed)
  [120] DEADLINE: Emeritus: QUIZ 11, Due Today! …                       ⏰ 2026-07-18
  [112] PAYMENT FAILED: Payment to JobCopilot failed — ₹5,900
  [ 90] RENEWAL: Loopcv subscription renews                             ⏰ 2026-06-14  (×4 collapsed)
```

Note the job alerts titled *"…Insurance Consultant…"* / *"…Payment Accuracy…"* are correctly
suppressed as **JOB** — classification is by **sender + Gmail category, not keywords** (the lesson
from exploring the real inbox: keyword "insurance/policy/premium" was 100% job spam).

## Real Gmail mode

```bash
npm install googleapis
export GOOGLE_CLIENT_ID=...        # OAuth client (Desktop app)
export GOOGLE_CLIENT_SECRET=...
export GOOGLE_REFRESH_TOKEN=...    # obtained once via the OAuth consent flow
npm run real
```

Scope: **`gmail.readonly` only.** Production would require Google's CASA security assessment for
restricted scopes (noted in `docs/saarthi/10 §8`). The refresh token is read from the environment;
it is never written to disk or into the data model.

## How it maps to the architecture

| File | Role | Base-truth ref |
|------|------|----------------|
| `src/sources/*` | `EmailSource` — fixtures or Gmail API (read-only) | connector `email_ingest` (`03 §6A`) |
| `src/rules.ts` | sender/category-first classification rules | AI classifier (`04`) |
| `src/classify.ts` | lane + extracted facts + dedup key | `IngestedMessage` (`01 §3.9`) |
| `src/dedup.ts` | collapse repeats of one event | (real-inbox lesson) |
| `src/rank.ts` | urgency = lane × due-date × amount | responsibility triage (`WF-FAM-006`) |
| `src/pipeline.ts` | fetch → classify → dedup → rank | `WF-FIN-022` discovery |
| `eval/` | golden-set precision/recall + dedup | evaluation discipline (`04 §4`) |

## Deliberately NOT in v0
Sending/modifying mail · money movement · family/multi-user · SMS · connectors beyond Gmail ·
net-worth aggregation · any autonomous action. Those are later slices — already specified in
`docs/saarthi/01`–`10`.

## Design notes / next steps
- **Extend a lane** = add a rule in `src/rules.ts` + a golden case in `fixtures` + `eval/golden.json`.
- Add the finance/insurance/government lanes by adding sender rules (they simply weren't present in
  the sample inbox).
- First candidate for a *write* action: one-tap "cancel this subscription" guidance — which moves
  from `suggest` to `assist` on the automation gradient.
