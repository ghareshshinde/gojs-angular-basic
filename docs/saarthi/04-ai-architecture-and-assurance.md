# AI Architecture & Assurance — v1.0

> How Saarthi's AI features are powered, and how we guarantee they work as intended. The governing
> stance: **Saarthi is workflow-first, AI-enhanced.** Accuracy is primarily an *architecture*
> property, not a *model* property — AI is deliberately contained, and deterministic systems carry
> the guarantees. A hallucination must degrade to "a suggestion a human declines" or "a
> schema-rejected output," never to a wrong bank transfer or a mis-filed return.

This document is the companion to the three foundational artifacts. It references FDT entities
(`01`), workflows and their automation gradient (`02`), and the model/infra connectors (`03 §7`).

---

## 1. Principles

1. **AI proposes, deterministic systems dispose.** The LLM decides *what to suggest*; the Workflow
   Engine and Policy Engine execute. No agent directly moves money, files with a government, or
   mutates an external record — every such step passes a human-approval gate.
2. **Ground, don't recall.** The model never recalls a family's facts from weights; it retrieves
   them from the Family Digital Twin with provenance. Ungrounded claims are flagged, not shown.
3. **Determinism for anything computable.** Tax, EMI, capital-gains, premium proration, sub-limit
   consumption — rules engines and functions, never the LLM.
4. **Abstain over guess.** Below a per-action confidence threshold, the agent escalates to a human
   or a guided flow rather than proceeding.
5. **Trust is earned and measured.** A workflow's automation level rises only after it clears
   accuracy thresholds on its golden set and in shadow. *Automation follows trust.*
6. **No model lock-in.** Every capability runs behind a router; any single model can be swapped or
   fail over without changing a workflow.

---

## 2. AI architecture

### 2.1 Model layer — gateway & router
- **Model gateway: LiteLLM** fronts all inference. Requests route by task class to
  **GLM · Qwen · Llama · DeepSeek · Gemma**, with automatic fallback on provider degradation.
- **Routing policy** is explicit per task: cheap/fast models for extraction & classification;
  stronger models for planning, reconciliation, and adjudication; deterministic tools for math.
- **Residency.** Anything touching `FINANCIAL`/`HEALTH`/`SENSITIVE_PII` (see FDT classification)
  runs on **self-hosted inference (vLLM)** in India-region infra; **Ollama** for local dev.
- **Determinism controls.** Low/zero temperature for structured tasks; fixed seeds where the
  provider supports it; version-pinned model ids recorded on every run for reproducibility.

### 2.2 Agent layer — planner + domain specialists
- A **single Planner** decomposes a `Responsibility` into steps and sequences child workflows
  (e.g. Marriage → register → name change → address propagation → nominee updates).
- **~12 domain specialists** (Investment, Insurance, Tax, Government, Travel, Healthcare,
  Education, Legal, Estate, Maintenance, Finance) reason within their lane only.
- Implemented as a **graph orchestration** (LangGraph-style) supporting long-running state,
  checkpoints, retries, tool calling, and human-approval interrupts — wrapped behind Saarthi's own
  orchestration interface so the framework is replaceable.

### 2.3 Memory & retrieval (separate from the LLM)
```
Working memory  →  Long memory  →  Family Digital Twin  →  Vector search  →  Knowledge Graph
```
- **GraphRAG** over the Twin's property graph for relationship-aware questions
  ("which policies cover my dependent parents and lapse before December?").
- **Structured retrieval** for exact facts (balances, due dates, policy numbers) — no LLM in the
  path for a value that can be looked up.
- **Traditional RAG** over documents (OCR'd via Docling/PaddleOCR/Tesseract) with citations back to
  the source `Document` entity.

### 2.4 Prompt/program optimization
- **DSPy** compiles and optimizes agent prompts against eval sets rather than hand-tuned strings,
  so prompt changes are measured, not vibes-based.

---

## 3. The containment model (why outputs are safe to act on)

Five layers, ordered by how much of the correctness guarantee each carries:

| # | Layer | Mechanism | Failure it prevents |
|---|-------|-----------|---------------------|
| 1 | **Execution boundary** | Workflow/Policy engine executes; LLM only proposes; approval gate on every mutating step | AI directly causing a real-world action |
| 2 | **Structured output** | Agents emit typed objects validated against FDT schema; malformed/out-of-vocab → reject + retry | Acting on a garbled or invented field |
| 3 | **Grounding + provenance** | Facts retrieved from the Twin with `consent_ref` + source; unground­able claims flagged | Hallucinated facts presented as truth |
| 4 | **Determinism for math/rules** | Financial/tax/insurance computations in code, not LLM | Arithmetic and rule-application errors |
| 5 | **Abstention** | Confidence thresholds; low confidence → human/guided path | Confident-but-wrong autonomous action |

Concretely: an agent recommending a health-policy renewal returns a *structured recommendation*
(`policy_ref`, `action`, `computed_premium`, `citations[]`), the premium delta is computed by a
function, the recommendation is schema-checked and grounded to the actual `HealthPolicy` entity,
and a human approves the payment. The LLM's linguistic reasoning is bounded on all sides.

---

## 4. Evaluation program (how we *prove* accuracy)

### 4.1 Golden datasets — one per workflow
Each Workflow Catalog entry ships a labeled dataset of real-shaped cases with known-correct
outcomes. This is why the catalog specifies `inputs` and `outcomes` so precisely — they are the
eval contract.

```yaml
# golden-set case format
case_id:        WF-INS-004/case-0142
workflow:       WF-INS-004                 # Health renewal (floater)
fixture:        { fdt_snapshot: "…", connector_stubs: "…" }   # deterministic inputs
expected:
  decision:     "increase_cover"
  computed:     { premium: 24500, sum_insured_gap: 500000 }   # exact, function-checked
  citations:    ["saarthi:policy:health:44", "saarthi:person:parent1"]
  must_not:     ["auto_pay_without_approval", "hallucinated_hospital"]
labels_by:      domain_expert                # provenance of the ground truth
tier:           P0
```

### 4.2 Metrics (per workflow, per action class)
| Metric | Definition |
|--------|-----------|
| **Task accuracy** | % of cases where the agent's decision matches ground truth |
| **Grounding rate** | % of factual claims with a valid citation to a Twin entity |
| **Hallucination rate** | claims with no valid source / invented entities (target → 0 for P0) |
| **Numeric exactness** | computed values equal to the deterministic reference (must be 100%) |
| **Calibration** | reliability of confidence scores (ECE) — does "0.9 confident" mean 90% right? |
| **Abstention correctness** | of cases it declined, how many *should* have been declined |
| **Injection resistance** | % of adversarial-content cases where no unauthorized action is taken |

### 4.3 Eval-in-CI contract
- Every prompt / model / router / retrieval change runs the affected golden sets in CI.
- **Merge gate:** no regression in task accuracy, grounding rate, or numeric exactness; hallucination
  rate must stay at/under target for the tier. Pinned model ids so results are reproducible.
- **LLM-as-judge** is a cheap first-pass screen only — run with a *different* model than the one
  under test, always backstopped by human-labeled ground truth. Judges drift; they never replace labels.

### 4.4 Pre-production gates
- **Shadow mode:** new capability runs in `observe` (predict, don't act) against live traffic;
  compare predictions to what humans actually did.
- **Canary:** promote to a small cohort with tightened thresholds and heightened monitoring.
- **Domain-expert sign-off** on rule sets and edge-case adjudication for high-stakes lanes
  (insurance claims, tax, estate) before any autonomy.

### 4.5 Accuracy targets by action class (illustrative, tier-dependent)
| Action class | Task acc. | Hallucination | Numeric | Autonomy ceiling |
|--------------|-----------|---------------|---------|------------------|
| Money movement / gov filing | ≥ 99% + human approval always | 0 | 100% | never fully auto |
| Renewal / bill pay (bounded ₹) | ≥ 98% | 0 | 100% | auto-with-approval → auto ≤ limit |
| Advisory / recommendation | ≥ 95% | ≤ 0.5% | 100% | suggest / assist |
| Extraction / classification | ≥ 97% field-level | n/a | n/a | assist (human confirms low-conf) |

---

## 5. Guardrails & safety

- **Content trust boundary.** External text (bill PDFs, connector responses, portal/OCR output,
  emails) is **untrusted data, never instructions.** Agents cannot be redirected by injected
  content; grounding + output validation contain prompt-injection attempts, and any content-driven
  request to escalate access or take an unexpected action is refused/escalated.
- **PII minimization.** Prompts carry the minimum necessary fields; `CREDENTIAL`-class data never
  enters a prompt or the graph (secrets vault only). `SENSITIVE_PII` is tokenized/masked in context.
- **Consent enforcement in the loop.** An agent can only reason over data with a live `consent_ref`;
  revoked-consent data is excluded from retrieval.
- **Output filtering.** Safety/PII-leak checks on generated text before it reaches the user or a
  connector.

---

## 6. Observability & operations

- **Full tracing (Langfuse / Phoenix + OpenTelemetry):** every agent step, tool call, retrieval,
  and token is traced; per-workflow accuracy, latency, cost, and grounding-failure are live metrics.
- **Online evaluation:** sampled live runs scored continuously against the same metric definitions.
- **Drift detection:** alert when a model/provider's live accuracy on a workflow slips; the router
  fails over to a known-good pinned model automatically.
- **Feedback as ground truth:** every human approval, edit, or rejection becomes a label that flows
  back into golden sets and DSPy optimization — the trust loop closes on real usage.
- **Incident path:** an accuracy-regression alert can demote a workflow's automation level
  (e.g. `auto` → `suggest`) automatically pending investigation.

---

## 7. Trust → automation gating (the closing loop)

The Workflow Catalog's gradient (`observe → suggest → assist → auto_with_approval → auto`) is not a
user setting — it is **driven by measured accuracy**, evaluated per workflow *and* per family:

```
promote(workflow, family) allowed IFF
   golden_set(workflow).task_accuracy ≥ tier_threshold
   AND shadow(workflow, family).agreement_with_human ≥ threshold over N cases
   AND hallucination_rate == 0 (for P0 tiers)
   AND policy_engine.permits(workflow, requested_level)
```

This is the operational meaning of *automation follows trust*: autonomy is a metric a workflow
earns, and can lose.

---

### Open questions / v1.1 candidates
- Formal spec of the confidence/calibration model and per-action thresholds (its own document).
- Golden-set governance: sizing, refresh cadence, drift in "ground truth" as regulations change.
- Multi-agent evaluation (does the Planner's *sequencing* — not just each agent — stay correct?).
- Cost/accuracy Pareto per task class as the router's model roster evolves.
- Red-team program for prompt injection via connector/document content.
