# Workflow Catalog — v1.0

> A **workflow** is a real family responsibility executed end-to-end: a marriage, a house move, a
> nominee update, a passport renewal, a tax filing. This catalog is the Workflow Engine's and the
> Planner's unit of work. Each entry names the **FDT entities** it reads/writes and the
> **Connectors** it calls, so the three foundational documents interlock.

**Coverage.** This v1.0 ships (a) the canonical **workflow schema**, (b) a **12-domain taxonomy**
with lifecycle staging, (c) **fully-specified exemplars** for the highest-value workflows, and
(d) an **enumerated index** that scales to the 500–1,000 target. Fully-specified entries are marked
★; index rows carry enough metadata (trigger, connectors, outcome, priority) to be specified on
demand. Section 8 tracks the running count toward the target.

---

## 1. Workflow schema

Every workflow — specified or indexed — conforms to this schema:

```yaml
id:            WF-<DOMAIN>-<nnn>          # stable identifier
name:          human-readable title
domain:        one of the 12 domains
lifecycle:     onboarding | recurring | event-triggered | crisis | seasonal
trigger:       what starts it (event / schedule / user-initiated / detected-risk)
actors:        [family roles + agents involved]
priority:      P0 (Phase-1 must-have) | P1 | P2 | P3
frequency:     one-off | annual | monthly | ad-hoc | lifetime-rare
inputs:        data & documents required to begin
preconditions: FDT state that must hold
fdt_reads:     [entities/attributes read]
fdt_writes:    [entities/events written]
connectors:    [Connector Registry ids used]  # or FALLBACK:<strategy>
steps:         ordered; each step = {action, actor, connector?, approval?}
approvals:     human-in-the-loop gates (who approves what, monetary limits)
outcomes:      success definition + artifacts produced
failure_modes: what can go wrong → fallback / escalation
sla:           target completion time
regulatory:    consent basis, DPDP/IRDAI/RBI/sectoral constraints
automation:    observe | suggest | assist | auto_with_approval | auto
```

### Step grammar
`action(actor[, connector][, approval])`. Approval gates are explicit wherever a step moves money,
files with government, or mutates an external record of truth — *AI thinks, humans decide.*

---

## 2. Domain taxonomy

| Code | Domain | Scope |
|------|--------|-------|
| **FIN** | Finance & banking | accounts, payments, cash-flow, credit, deposits |
| **INV** | Investments & wealth | MF/equity/PPF/NPS, goals, rebalancing |
| **INS** | Insurance & protection | life/health/motor/home, renewals, claims |
| **TAX** | Tax & compliance | filing, advance tax, TDS, notices |
| **GOV** | Government & identity | Aadhaar/PAN/passport/DL, schemes, benefits |
| **PROP** | Property & assets | property tax, registration, rent, vehicles |
| **HLTH** | Healthcare | records, appointments, chronic care, vaccinations |
| **EDU** | Education | admissions, fees, exams, scholarships |
| **TRVL** | Travel & mobility | passport/visa checks, bookings, forex, FASTag |
| **HOME** | Home & lifestyle | utilities, subscriptions, maintenance, staff |
| **LIFE** | Life events & legal | marriage, birth, death, will, estate, POA |
| **FAM** | Family ops & meta | onboarding, digital twin hygiene, preparedness |

### Lifecycle lanes (orthogonal to domain)
- **Onboarding** — first-time capture into the Twin.
- **Recurring** — scheduled obligations (EMIs, bills, renewals, filings).
- **Event-triggered** — fired by an FDT event or detected risk.
- **Seasonal** — calendar windows (tax season, admissions, budget changes).
- **Crisis** — hospitalisation, death, fraud, loss of document, emergency.

---

## 3. Fully-specified exemplars (★)

The following are specified at implementation depth. They were chosen as the P0 spine — the
workflows that deliver "Responsibilities Successfully Managed" fastest.

### ★ WF-FAM-001 — Family Onboarding & Digital-Twin Bootstrap
```yaml
domain: FAM | lifecycle: onboarding | priority: P0 | frequency: one-off | automation: assist
trigger: user-initiated (new family signs up)
actors: [primary_person, Planner agent, all domain agents (read-only ingest)]
inputs: mobile (OTP), consent to fetch, optional DigiLocker/AA linkage
preconditions: none
steps:
  1. verify_identity(primary_person, connector: aadhaar_ekyc, approval: user-otp)
  2. request_consent(purpose:"twin bootstrap", scopes:[identity,financial,insurance], connector: aa_consent)
  3. pull_documents(connector: digilocker)            # PAN, DL, RC, education, etc.
  4. discover_accounts(connector: account_aggregator) # banks, deposits, insurance, NPS
  5. discover_epf_nps(connectors: [epfo, nps_cra])
  6. ocr_and_classify(uploaded_docs, agent: ingest)   # FALLBACK for non-API sources
  7. entity_resolve_and_dedupe(agent: twin)
  8. draft_family_graph → present_for_confirmation(primary_person, approval: review-merges)
  9. compute_preparedness_index(agent: planner)
fdt_reads: []
fdt_writes: [Family, Person*, Identity*, FinancialAccount*, InsurancePolicy*, Document*, Consent, PreparednessRecomputed]
connectors: [aadhaar_ekyc, digilocker, account_aggregator, epfo, nps_cra] + FALLBACK: document-upload+OCR
approvals: user-otp (identity), review-merges (before commit)
outcomes: populated FDT, initial preparedness index, prioritised responsibility list
failure_modes:
  - AA consent declined → degrade to document-upload flow, mark accounts unverified
  - OCR low confidence → raise AssetReview responsibility
sla: interactive session + async fetch completing < 24h
regulatory: DEPA consent artifact per fetch; DPDP notice+purpose limitation; India-region storage
```

### ★ WF-INS-004 — Health Insurance Renewal (family floater)
```yaml
domain: INS | lifecycle: recurring/event-triggered | priority: P0 | frequency: annual | automation: auto_with_approval
trigger: FDT event RenewalDue{days_left in [45,30,15,7,1]}
actors: [owner (payer), Insurance agent, Planner]
inputs: policy_ref, payment instrument, any change in insured members/sum insured
preconditions: policy.status in {active, renewal_due}; nominee present (else chain WF-INS-011)
steps:
  1. fetch_renewal_quote(connector: insurer_api | FALLBACK: agent_portal_scrape)
  2. analyse(agent: insurance)  # premium delta, NCB, sum-insured adequacy vs family health profile
  3. recommend(agent: insurance) # keep / increase cover / port (chain WF-INS-006) / switch insurer
  4. present_decision(owner, approval: renewal-choice)
  5. pay_premium(connector: upi | bbps, approval: payment ≤ auto-limit else explicit)
  6. fetch_updated_policy_doc(connector: insurer_api | digilocker)
  7. update_twin + schedule_next(agent: twin)
fdt_reads: [HealthPolicy, insured Persons, MedicalCondition, HealthRecord, Bill(history)]
fdt_writes: [PremiumPaid, PolicyRenewed, Document(new policy), RenewalDue(next year)]
connectors: [insurer_api|IRDAI-registered, bbps, upi, digilocker]
approvals: renewal-choice; payment gate (monetary policy from Policy Engine)
outcomes: continuous cover (no lapse), updated policy doc, next-year responsibility scheduled
failure_modes:
  - grace period breach risk → escalate criticality, notify all adults
  - premium exceeds auto-limit → force explicit approval
  - insurer API down → BBPS biller fallback, else guided manual + reminder
sla: complete ≥ 7 days before renewal_date
regulatory: IRDAI product rules; free-look on any switch; consent for health-profile use
```

### ★ WF-INS-020 — Cashless Hospitalisation (crisis)
```yaml
domain: INS | lifecycle: crisis | priority: P0 | frequency: ad-hoc | automation: assist
trigger: user-initiated (admission) OR HealthRecord admission event
actors: [patient, caregiver, Insurance agent, Healthcare agent]
inputs: policy_ref, hospital, ailment, estimated cost, treating doctor
preconditions: active health policy; hospital in network (else chain reimbursement WF-INS-021)
steps:
  1. identify_best_policy(agent: insurance)  # if multiple, optimise sub-limits/room-rent
  2. verify_network_and_TPA(connector: insurer/TPA_api)
  3. initiate_pre_auth(connector: TPA_api | FALLBACK: hospital-desk-assist, approval: caregiver-confirm)
  4. assemble_documents(agent: healthcare)   # ID, policy, doctor's notes from Twin
  5. track_pre_auth_status(connector: TPA_api)  # poll/webhook
  6. on_query → respond_with_docs(agent: insurance)
  7. on_discharge → final_bill_reconciliation, settlement_tracking
  8. record_claim + update_NCB/sub-limit consumption(agent: twin)
fdt_reads: [HealthPolicy, insured Person, HealthRecord, Identity, cashless_hospitals]
fdt_writes: [Claim, ClaimIntimated, PreAuthRequested/Approved, ClaimSettled, sub-limit consumption]
connectors: [TPA_api, ABDM/ABHA (records), insurer_api]
approvals: caregiver-confirm (pre-auth), any co-pay payment
outcomes: cashless approval, minimised out-of-pocket, complete claim record; grievance chain if denied
failure_modes: pre-auth denied → escalate WF-INS-022 (grievance/Ombudsman); network mismatch → reimbursement
sla: pre-auth initiated < 2h of admission
regulatory: IRDAI cashless norms; ABDM consent for records; Bima Sugam future path
```

### ★ WF-GOV-002 — Passport Renewal
```yaml
domain: GOV | lifecycle: event-triggered | priority: P0 | frequency: lifetime-rare (10y) | automation: assist
trigger: IdentityExpiringSoon{scheme:passport, days_left ≤ 365} OR upcoming Travel needing validity
actors: [holder, Government agent, Travel agent]
inputs: current passport, address proof, photos, appointment preference
preconditions: Identity(passport) present; Address current & KYC-proofed
steps:
  1. assess_eligibility(agent: government)  # tatkal vs normal, change of particulars?
  2. prefill_application(connector: passport_seva | FALLBACK: guided-form)
  3. attach_documents(connector: digilocker)  # address/identity proofs
  4. pay_fee(connector: upi, approval: payment)
  5. book_appointment(connector: passport_seva, approval: slot-choice)
  6. add_to_calendar + prep_checklist(agent: government)
  7. on_issue → update Identity + propagate (chain WF-GOV-010 if number changes)
fdt_reads: [Identity(passport), Address, Document(proofs), Person, Travel]
fdt_writes: [WorkflowRun, IdentityRenewed, Document(new passport), Address propagation triggers]
connectors: [passport_seva, digilocker, upi]
approvals: slot-choice, payment
outcomes: appointment booked, checklist ready, Twin updated on issue
failure_modes: no slots → widen PSK/date search + notify; particulars mismatch → chain address/name update first
sla: initiate ≥ 60 days before travel or expiry
regulatory: MEA rules; police verification awareness; DPDP for stored proofs
```

### ★ WF-GOV-010 — Address Change Propagation ("update everywhere from one place")
```yaml
domain: GOV | lifecycle: event-triggered | priority: P0 | frequency: ad-hoc | automation: auto_with_approval
trigger: AddressChanged event
actors: [person, Government/Finance/Insurance agents, Planner]
inputs: new address + KYC proof, list of holders of old address
preconditions: new Address verified with proof
steps:
  1. enumerate_propagation_targets(agent: planner)  # banks, MF (KRA/CKYC), insurers, Aadhaar, PAN, DL, RC, utilities, employer, subscriptions
  2. group_by_mechanism(agent: connector-platform)  # CKYC/KRA one-shot vs per-institution vs manual
  3. update_central_kyc(connector: ckyc | kra)       # propagates to many financial institutions
  4. update_aadhaar(connector: uidai_selfservice, approval: otp)
  5. update_each_remaining(connectors: bank_api, insurer_api, dl_parivahan, utility_bbps | FALLBACK: guided/manual)
  6. track_status_per_target, retry failures
  7. reconcile → mark Address.propagation_targets updated(agent: twin)
fdt_reads: [Address(old,new), Person, Identity, FinancialAccount, InsurancePolicy, Subscription, Institution]
fdt_writes: [AddressPropagationRequested, AddressPropagatedTo{target}*, Document(updated proofs)]
connectors: [ckyc, kra, uidai_selfservice, bank_api, insurer_api, dl_parivahan, bbps] + FALLBACK: guided-manual
approvals: batch consent to propagate; per-channel OTPs
outcomes: address consistent across all institutions; residual manual list with reminders
failure_modes: institution lacks API → generate pre-filled forms + track manual completion
sla: financial+identity targets < 7 days; long-tail tracked to closure
regulatory: KYC/CKYC norms; consent per institution; audit trail of every propagation
```

### ★ WF-LIFE-030 — Bereavement, Nominee Claims & Estate Settlement
```yaml
domain: LIFE | lifecycle: crisis | priority: P0 | frequency: lifetime-rare | automation: assist
trigger: PersonDeceased event
actors: [surviving family, Estate/Legal agent, Insurance/Finance/Government agents, Planner]
inputs: death certificate, list of deceased's assets/policies/liabilities/nominations
preconditions: deceased Person in Twin with linked assets & nominees
steps:
  1. compassionate_mode(agent: planner)  # pause noise, surface only essential actions
  2. procure_death_certificate(connector: crs/municipal | FALLBACK: guided)
  3. enumerate_estate(agent: estate)     # accounts, policies, deposits, property, EPF/NPS, liabilities
  4. life_insurance_claims(agent: insurance, connector: insurer_api)  # per policy → nominee
  5. bank/MF/demat_transmission(connectors: bank_api, cams/kfintech, cdsl/nsdl)  # nominee/legal-heir
  6. epf_nps_claims(connectors: epfo, nps_cra)
  7. subscription/utility_terminate_or_transfer(agents: home)
  8. update_government(connectors: aadhaar_deactivation, pension_cessation)
  9. liabilities_handling(agent: finance)  # loan insurance, restructuring
  10. produce_estate_summary + pending_actions(agent: estate)
fdt_reads: [deceased Person, all OWNS/NOMINEE_ON edges, InsurancePolicy, LoanAccount, GovernmentBenefit]
fdt_writes: [Person.lifecycle=deceased, Claim*, asset transmission events, BenefitCessation, EstateSummary Document]
connectors: [insurer_api, bank_api, cams, kfintech, cdsl, nsdl, epfo, nps_cra, crs] + heavy FALLBACK
approvals: legal-heir identity gates; each claim submission
outcomes: nominees receive dues; assets transmitted; liabilities settled; single estate ledger
failure_modes: nominee missing → succession/legal-heir path (longer, guided); disputes → legal referral
sla: insurance intimation < 30 days; full settlement tracked over months
regulatory: succession law, IRDAI claim timelines, bank transmission rules, DPDP post-mortem data handling
```

### ★ WF-TAX-001 — Annual Income-Tax Filing
```yaml
domain: TAX | lifecycle: seasonal | priority: P0 | frequency: annual | automation: assist
trigger: FilingWindowOpen (AY) OR user-initiated
actors: [taxpayer(s), Tax agent, Investment agent, Planner]
inputs: PAN, Form-16, AIS/TIS, 26AS, capital-gains statements, deduction proofs
preconditions: TaxProfile present; income sources linked
steps:
  1. aggregate_income(agent: tax, connectors: income_tax_ais, form26AS, cams/kfintech CG-statements)
  2. reconcile_TDS(agent: tax)  # flag mismatches → TDSMismatch responsibility
  3. optimise_deductions & regime(agent: tax)  # old vs new
  4. compute_liability/refund(agent: tax)
  5. review_with_user(approval: return-confirmation)
  6. file_return(connector: income_tax_eportal, approval: e-verify)
  7. e_verify(connector: aadhaar_otp | net-banking)
  8. track_refund + archive(agent: twin)
fdt_reads: [TaxProfile, Income, InvestmentHoldings, InsurancePolicy(80C/D), LoanAccount(interest), Document(proofs)]
fdt_writes: [FilingCompleted Document(ITR-V), RefundStatus, next-year AdvanceTax schedule]
connectors: [income_tax_eportal, income_tax_ais, form26AS, cams, kfintech]
approvals: return-confirmation, e-verify
outcomes: filed & e-verified return, refund tracked, tax-saving recommendations for next year
failure_modes: AIS mismatch → correction sub-flow; portal downtime → retry + deadline guard
sla: file ≥ 15 days before due date
regulatory: Income-Tax Act; consent for AIS/26AS pull; no auto-file without explicit e-verify
```

### ★ WF-INV-014 — Nominee Addition / Update Across Assets
```yaml
domain: INV | lifecycle: event-triggered | priority: P0 | frequency: ad-hoc | automation: assist
trigger: NomineeMissing risk event OR life event (marriage/birth)
actors: [asset owner, Investment/Insurance/Finance agents]
inputs: nominee details (person, relationship, share, guardian if minor)
preconditions: assets/policies present in Twin
steps:
  1. scan_all_assets_for_nominee_gaps(agent: planner)
  2. propose_consistent_nomination(agent: planner)  # align across bank/MF/demat/insurance/EPF/NPS
  3. confirm_with_owner(approval: nominee-details)
  4. register_nominee_per_asset(connectors: bank_api, cams/kfintech, cdsl/nsdl, insurer_api, epfo, nps_cra)
  5. handle_minor→guardian; track completion; store acknowledgements
fdt_writes: [Nominee*, NomineeRegistered events, Document(acknowledgements)]
outcomes: every asset has a valid, consistent nominee; preparedness index up
failure_modes: offline-only assets → pre-filled forms + reminder
regulatory: SEBI/RBI/IRDAI nomination mandates; guardian rules for minors
```

### ★ WF-PROP-005 — Vehicle Compliance Bundle (insurance + PUC + FASTag + service)
```yaml
domain: PROP | lifecycle: recurring | priority: P1 | frequency: annual+ | automation: auto_with_approval
trigger: any of MotorInsuranceExpiringSoon / PUCExpiringSoon / FastagLowBalance / ServiceDue / ChallanReceived
actors: [vehicle owner, Property/Finance agents]
steps:
  1. renew_motor_insurance(connector: insurer_api|bbps, approval: quote+payment)  # NCB carry-over
  2. renew_PUC(connector: parivahan|vendor, FALLBACK: reminder+locator)
  3. recharge_FASTag(connector: netc_fastag, approval: payment)
  4. book_service(connector: OEM/vendor, FALLBACK: reminder)
  5. resolve_challans(connector: parivahan_echallan, approval: payment)
fdt_reads: [Vehicle, MotorPolicy, FastagRef]
fdt_writes: [PolicyRenewed, PUCRenewed, FastagRecharged, ChallanPaid, ServiceLogged]
outcomes: vehicle continuously road-legal; no lapse; challans cleared
regulatory: MV Act; IRDAI motor rules; mandatory TP cover
```

### ★ WF-HOME-002 — Recurring Bills & Autopay Governance
```yaml
domain: HOME | lifecycle: recurring | priority: P0 | frequency: monthly | automation: auto_with_approval
trigger: BillFetched / BillDue events (BBPS + statement parsing)
actors: [payer, Finance agent, Planner]
steps:
  1. fetch_bills(connector: bbps, FALLBACK: email-parse/statement-OCR)
  2. anomaly_check(agent: finance)  # spike vs history → hold + flag
  3. pay(connector: upi|bbps, approval: if>auto-limit or anomaly)
  4. reconcile + categorise(agent: finance)
fdt_reads: [Bill(history), FinancialAccount, autopay policies]
fdt_writes: [BillPaid, BillAmountAnomaly, cash-flow projection update]
outcomes: no missed/late bills; anomalies caught before payment; clean expense ledger
regulatory: RBI e-mandate rules; NPCI BBPS; consent for statement access
```

### ★ WF-EDU-003 — School Fee & Academic Calendar Management
```yaml
domain: EDU | lifecycle: recurring/seasonal | priority: P1 | frequency: termly | automation: assist
trigger: FeeDue / ExamUpcoming / AdmissionWindowOpen / ScholarshipDeadline
actors: [parent, Education agent]
steps: fetch_fee_schedule → remind → pay(connector: school_portal|bbps, approval: payment)
       → track exams/results → surface scholarship eligibility → archive receipts/reports
fdt_reads: [EducationRecord, student Person, Bill]
fdt_writes: [FeePaid, ExamReminder, ResultRecorded, ScholarshipOpportunity]
outcomes: fees never missed, academic timeline visible, scholarships not lost to deadlines
regulatory: institution-specific; DPDP for minors' data (guardian consent)
```

### ★ WF-FIN-012 — Loan EMI Health & Prepayment Optimisation
```yaml
domain: FIN | lifecycle: recurring/event-triggered | priority: P1 | frequency: monthly | automation: suggest
trigger: EMIDue / RateChanged / surplus-cash detected / PrepaymentOpportunity
actors: [borrower, Finance/Investment agents, Planner]
steps: ensure_EMI_funded(agent: finance) → detect_surplus → simulate_prepay_vs_invest(agent: planner)
       → recommend(approval: prepay-decision) → execute(connector: bank_api, approval: payment)
       → detect_better_refi(agent: finance) → suggest_balance_transfer
fdt_reads: [LoanAccount, Income, BankAccount, InvestmentHoldings, Goal]
fdt_writes: [EMIPaid, PrepaymentMade, refi recommendation]
outcomes: no missed EMIs, optimised interest cost, refinance opportunities surfaced
regulatory: RBI fair-practice; no auto-prepay without explicit approval
```

### ★ WF-FAM-013 — Decision-Feedback Capture & Preference Learning
```yaml
domain: FAM | lifecycle: event-triggered/recurring | priority: P0 | frequency: continuous | automation: auto
trigger: any Decision.* event (SuggestionDeclined / SuggestionModified / SuggestionIgnored) OR periodic consolidation
actors: [any Person who decides, Planner, all domain agents (as suggesters)]
inputs: the Suggestion + the user's response; optionally a volunteered reason
preconditions: a Suggestion exists with a non-accepted outcome
steps:
  1. record_outcome(agent: twin)                 # write Suggestion.status + Decision.* event
  2. capture_reason_if_present(agent: twin)       # volunteered text/quick-reply → DecisionFeedback(reason_source: volunteered)
  3. infer_reason(agent: planner)                 # from context/timing; low-confidence → mark inferred, do NOT overweight
  4. maybe_request_feedback(agent: planner, approval: user-optional)
       # ONLY if: high-value/repeated decline, ambiguous, and within feedback-budget. One tap, dismissible. Principle 6.
  5. consolidate_into_preference(agent: planner)  # ≥N corroborating signals → PreferenceLearned/Strengthened
  6. apply_preference(agent: planner)             # future suggestions retrieved-through preferences (immediate, per-family)
  7. enqueue_for_aggregate_learning(agent: eval)  # de-identified signal → golden sets / DSPy / thresholds (governed, offline)
fdt_reads: [Suggestion, DecisionFeedback, Preference, related workflow context]
fdt_writes: [DecisionFeedback, PreferenceLearned/Strengthened/Applied, TrustScore recompute]
connectors: []   # internal; no external system
approvals: feedback request is always optional and dismissible
outcomes: every non-accepted suggestion becomes signal; personalisation improves immediately;
          aggregate model improvement is fed a governed, de-identified stream
failure_modes:
  - no reason available & not worth asking → store outcome only, learn from the behaviour signal
  - feedback fatigue → hard budget on how often we ask (per family, per period)
  - one-off decline → do not overfit; preferences need corroboration
sla: outcome recorded synchronously; preference consolidation near-real-time; aggregate learning batched
regulatory: DPDP — feedback is personal data under consent; aggregate learning uses de-identified signal;
            preferences are always reversible (applied via retrieval, never fine-tuned into weights)
automation: fully automatic capture; asking for feedback is throttled and optional
```

> **13 exemplars specified.** The same schema is applied to every index entry below on activation.

---

## 4. Enumerated catalog (index)

Rows below carry `id · name · lifecycle(L) · priority(P) · key connectors · primary outcome`.
`L`: On=onboarding, Rc=recurring, Ev=event, Se=seasonal, Cr=crisis. Fully-specified exemplars are
cross-referenced (★). This index is the backlog the schema in §1 is applied to.

### 4.1 FIN — Finance & banking
| ID | Name | L | P | Connectors | Outcome |
|----|------|---|---|-----------|---------|
| WF-FIN-001 | Link & verify bank account | On | P0 | account_aggregator | account in Twin |
| WF-FIN-002 | Consolidated balance & cash-flow view | Rc | P0 | AA | unified liquidity picture |
| WF-FIN-003 | Salary-credit detection & allocation | Ev | P1 | AA | auto goal/bill allocation |
| WF-FIN-004 | Low-balance guard before autopay | Ev | P0 | AA, upi | no bounced mandates |
| WF-FIN-005 | Idle-cash sweep to liquid fund | Ev | P2 | AA, cams | better yield on idle cash |
| WF-FIN-006 | Duplicate/forgotten account detection | Rc | P2 | AA | rediscovered assets |
| WF-FIN-007 | Credit-card bill pay & rewards optimise | Rc | P1 | bbps, AA | no interest, rewards used |
| WF-FIN-008 | Credit-score monitoring & alerts | Rc | P2 | bureau | credit health tracked |
| WF-FIN-009 | Fraud/anomaly transaction alert | Ev | P0 | AA | early fraud catch |
| WF-FIN-010 | Cheque/mandate management | Rc | P2 | bank_api | mandate hygiene |
| WF-FIN-011 | FD ladder & maturity reinvest | Ev | P1 | AA, bank_api | no idle matured FDs (★-style) |
| WF-FIN-012 | Loan EMI health & prepayment | Rc | P1 | bank_api | ★ specified |
| WF-FIN-013 | Balance-transfer / refi advisor | Ev | P2 | bank_api | lower interest cost |
| WF-FIN-014 | Overdraft/short-term liquidity plan | Ev | P2 | AA | shortfall avoided |
| WF-FIN-015 | Joint-account & authorised-user setup | Ev | P3 | bank_api | shared access configured |
| WF-FIN-016 | Dormant-account reactivation | Ev | P2 | bank_api | account revived |
| WF-FIN-017 | Standing-instruction audit | Rc | P2 | AA | stale SIs cancelled |
| WF-FIN-018 | Forex/NRE-NRO management (NRI) | Rc | P2 | bank_api | compliant NRI banking |
| WF-FIN-019 | Cash-flow forecast (30/60/90d) | Rc | P1 | AA | shortfalls predicted |
| WF-FIN-020 | Emergency-fund adequacy check | Rc | P1 | AA | 6-month buffer maintained |

### 4.2 INV — Investments & wealth
| ID | Name | L | P | Connectors | Outcome |
|----|------|---|---|-----------|---------|
| WF-INV-001 | Portfolio consolidation (MF+equity+EPF+NPS) | On | P0 | cams, kfintech, cdsl, nsdl, epfo, nps_cra | single net-worth view |
| WF-INV-002 | Goal-based investment plan | Ev | P1 | — | goals funded & tracked |
| WF-INV-003 | SIP setup & mandate | Ev | P1 | mf_central, upi | disciplined investing |
| WF-INV-004 | Portfolio rebalancing advisory | Rc | P2 | cams | target allocation held |
| WF-INV-005 | Asset-allocation drift alert | Ev | P2 | AA | risk kept in band |
| WF-INV-006 | Tax-loss / LTCG harvesting | Se | P2 | cdsl, cams | tax-efficient gains |
| WF-INV-007 | Dividend/interest tracking | Rc | P2 | AA | income visibility |
| WF-INV-008 | ELSS 80C top-up before deadline | Se | P1 | mf_central | 80C maximised |
| WF-INV-009 | PPF annual contribution reminder | Se | P1 | bank_api | PPF not lapsed |
| WF-INV-010 | NPS tier-1/2 contribution & 80CCD | Se | P2 | nps_cra | extra 50k deduction |
| WF-INV-011 | EPF passbook sync & UAN hygiene | Rc | P1 | epfo | EPF tracked, KYC done |
| WF-INV-012 | Sovereign Gold Bond / gold plan | Ev | P3 | — | gold allocation |
| WF-INV-013 | Retirement corpus projection | Rc | P1 | — | retirement on track |
| WF-INV-014 | Nominee addition across assets | Ev | P0 | multi | ★ specified |
| WF-INV-015 | Demat consolidation & inactive folio | On | P2 | cdsl, nsdl | tidy holdings |
| WF-INV-016 | Children's education corpus plan | Ev | P1 | — | education funded |
| WF-INV-017 | Windfall deployment plan | Ev | P2 | — | lump-sum invested well |
| WF-INV-018 | ESOP/RSU tracking & tax | Ev | P3 | — | equity comp managed |
| WF-INV-019 | Unclaimed investments (IEPF) search | On | P2 | iepf | lost money recovered |
| WF-INV-020 | Risk-profiling & rebalance trigger | On | P1 | — | portfolio fits risk |

### 4.3 INS — Insurance & protection
| ID | Name | L | P | Connectors | Outcome |
|----|------|---|---|-----------|---------|
| WF-INS-001 | Coverage-gap analysis (life/health/motor/home) | On | P0 | AA, insurer_api | gaps quantified |
| WF-INS-002 | Term-life adequacy & purchase | Ev | P1 | insurer_api | family protected |
| WF-INS-003 | Health cover adequacy | On | P1 | insurer_api | right sum insured |
| WF-INS-004 | Health renewal (floater) | Rc | P0 | insurer_api, bbps | ★ specified |
| WF-INS-005 | Life-policy premium payment | Rc | P0 | bbps, upi | no lapse |
| WF-INS-006 | Health-policy portability | Ev | P2 | insurer_api | better insurer, NCB kept |
| WF-INS-007 | Motor renewal | Rc | P1 | insurer_api | vehicle insured |
| WF-INS-008 | Home/contents insurance | Ev | P2 | insurer_api | property protected |
| WF-INS-009 | Travel insurance for trip | Ev | P2 | insurer_api | trip covered |
| WF-INS-010 | Personal-accident cover | Ev | P3 | insurer_api | PA cover in place |
| WF-INS-011 | Add/update nominee on policy | Ev | P0 | insurer_api | valid nomination |
| WF-INS-012 | Grace-period lapse rescue | Cr | P0 | insurer_api | policy revived |
| WF-INS-013 | Policy-document digitisation | On | P0 | digilocker | policies in Twin |
| WF-INS-014 | Rider optimisation review | Rc | P3 | insurer_api | cost-effective riders |
| WF-INS-015 | Duplicate/overlapping cover audit | Rc | P2 | insurer_api | no wasted premium |
| WF-INS-016 | ULIP/endowment surrender analysis | Ev | P3 | insurer_api | informed exit |
| WF-INS-017 | Free-look cancellation | Ev | P2 | insurer_api | mis-sold policy exit |
| WF-INS-018 | Super top-up recommendation | Ev | P2 | insurer_api | cheap extra cover |
| WF-INS-019 | Senior-citizen health plan | Ev | P1 | insurer_api | parents covered |
| WF-INS-020 | Cashless hospitalisation | Cr | P0 | TPA_api, ABDM | ★ specified |
| WF-INS-021 | Reimbursement claim | Cr | P0 | insurer_api | out-of-pocket recovered |
| WF-INS-022 | Claim grievance / Ombudsman | Cr | P1 | insurer_api, ombudsman | denied claim escalated |
| WF-INS-023 | Motor claim (own damage/TP) | Cr | P1 | insurer_api | vehicle claim settled |
| WF-INS-024 | Life-insurance maturity claim | Ev | P1 | insurer_api | maturity received |

### 4.4 TAX — Tax & compliance
| ID | Name | L | P | Connectors | Outcome |
|----|------|---|---|-----------|---------|
| WF-TAX-001 | Annual ITR filing | Se | P0 | income_tax_eportal, AIS | filed & verified (★) |
| WF-TAX-002 | Advance-tax computation & payment | Se | P1 | income_tax_eportal | penalty avoided |
| WF-TAX-003 | TDS reconciliation (26AS/AIS) | Se | P1 | form26AS, AIS | mismatches fixed |
| WF-TAX-004 | Investment-proof submission to employer | Se | P1 | — | correct TDS |
| WF-TAX-005 | Capital-gains computation | Se | P1 | cams, cdsl | CG tax correct |
| WF-TAX-006 | Old-vs-new regime optimiser | Se | P1 | — | lower tax |
| WF-TAX-007 | Tax-notice response | Ev | P1 | income_tax_eportal | notice resolved |
| WF-TAX-008 | Refund tracking & follow-up | Ev | P2 | income_tax_eportal | refund received |
| WF-TAX-009 | Form-15G/15H submission | Se | P2 | bank_api | TDS avoided (eligible) |
| WF-TAX-010 | GST filing (business owner) | Rc | P2 | gstn | GST compliant |
| WF-TAX-011 | Professional-tax / TDS on rent (26QC) | Se | P3 | income_tax_eportal | compliance done |
| WF-TAX-012 | Tax-saving planner (year-start) | Se | P1 | — | proactive tax saving |

### 4.5 GOV — Government & identity
| ID | Name | L | P | Connectors | Outcome |
|----|------|---|---|-----------|---------|
| WF-GOV-001 | Aadhaar update (mobile/biometric/demographic) | Ev | P1 | uidai_selfservice | Aadhaar current |
| WF-GOV-002 | Passport renewal | Ev | P0 | passport_seva, digilocker | ★ specified |
| WF-GOV-003 | Passport new (incl. minor) | Ev | P1 | passport_seva | passport issued |
| WF-GOV-004 | PAN apply/correction | Ev | P1 | nsdl_pan | PAN valid |
| WF-GOV-005 | PAN–Aadhaar linkage | Se | P0 | income_tax_eportal | PAN not inoperative |
| WF-GOV-006 | Driving-licence renewal | Ev | P1 | parivahan | DL valid |
| WF-GOV-007 | Voter-ID registration/update | Ev | P3 | eci | voter enrolled |
| WF-GOV-008 | DigiLocker setup & doc pull | On | P0 | digilocker | docs digitised |
| WF-GOV-009 | ABHA (health ID) creation | On | P1 | abdm | health records linked |
| WF-GOV-010 | Address change propagation | Ev | P0 | multi | ★ specified |
| WF-GOV-011 | Name change propagation (post-marriage) | Ev | P1 | multi | name consistent |
| WF-GOV-012 | Birth-certificate procurement | Ev | P1 | crs | certificate obtained |
| WF-GOV-013 | Death-certificate procurement | Cr | P0 | crs | certificate obtained |
| WF-GOV-014 | Marriage registration | Ev | P1 | state_portal | marriage registered |
| WF-GOV-015 | Ration-card / PDS management | Ev | P3 | state_pds | benefits retained |
| WF-GOV-016 | Government-scheme eligibility scan | Rc | P1 | umang, myscheme | benefits claimed |
| WF-GOV-017 | PM-JAY / Ayushman enrolment | Ev | P1 | pmjay | health scheme active |
| WF-GOV-018 | Pension (EPS/senior) management | Rc | P2 | epfo | pension flowing |
| WF-GOV-019 | Property-tax payment | Se | P1 | municipal | property tax paid |
| WF-GOV-020 | Utility/subsidy (LPG/DBT) linkage | Ev | P3 | umang | subsidy credited |
| WF-GOV-021 | Digital Life Certificate (Jeevan Pramaan) | Se | P2 | jeevan_pramaan | pension continued |
| WF-GOV-022 | Court/challan/legal-notice tracking | Ev | P2 | parivahan_echallan | dues cleared |

### 4.6 PROP — Property & assets
| ID | Name | L | P | Connectors | Outcome |
|----|------|---|---|-----------|---------|
| WF-PROP-001 | Property onboarding & valuation | On | P1 | — | property in Twin |
| WF-PROP-002 | Property-tax payment | Se | P1 | municipal | tax paid |
| WF-PROP-003 | Rent collection & agreement renewal | Rc | P2 | upi | rent + compliant lease |
| WF-PROP-004 | Home-loan & property linkage | On | P1 | AA | asset-liability linked |
| WF-PROP-005 | Vehicle compliance bundle | Rc | P1 | multi | ★ specified |
| WF-PROP-006 | Vehicle purchase/sale + RC transfer | Ev | P2 | parivahan | ownership transferred |
| WF-PROP-007 | Home maintenance schedule | Rc | P3 | vendors | upkeep tracked |
| WF-PROP-008 | Society maintenance dues | Rc | P3 | bbps | dues paid |
| WF-PROP-009 | Property documents vault (deed/khata) | On | P1 | digilocker | title docs safe |
| WF-PROP-010 | Utility new-connection/transfer | Ev | P3 | utility | connection managed |
| WF-PROP-011 | Precious-asset (gold) register & insure | On | P3 | insurer_api | valuables tracked |
| WF-PROP-012 | Property sale — capital-gains + reinvest | Ev | P2 | income_tax_eportal | CG optimised (54/54EC) |

### 4.7 HLTH — Healthcare
| ID | Name | L | P | Connectors | Outcome |
|----|------|---|---|-----------|---------|
| WF-HLTH-001 | Health-record ingestion (ABDM) | On | P1 | abdm | records unified |
| WF-HLTH-002 | Vaccination schedule (children) | Rc | P1 | cowin/abdm | immunisation on time |
| WF-HLTH-003 | Chronic-condition management (seniors) | Rc | P1 | abdm | meds/reviews tracked |
| WF-HLTH-004 | Prescription refill reminders | Rc | P2 | pharmacy | no missed meds |
| WF-HLTH-005 | Doctor appointment booking | Ev | P2 | provider | appointment set |
| WF-HLTH-006 | Preventive health-checkup scheduling | Rc | P2 | provider | annual checkup done |
| WF-HLTH-007 | Lab-report tracking & trends | Ev | P2 | lab | health trends visible |
| WF-HLTH-008 | Emergency medical info card | On | P0 | — | ER-ready profile |
| WF-HLTH-009 | Second-opinion / referral coordination | Ev | P3 | provider | care coordinated |
| WF-HLTH-010 | Elder-care daily check-in | Rc | P2 | — | parents monitored |

### 4.8 EDU — Education
| ID | Name | L | P | Connectors | Outcome |
|----|------|---|---|-----------|---------|
| WF-EDU-001 | School admission application | Se | P1 | school_portal | admission secured |
| WF-EDU-002 | Admission-document readiness | Se | P1 | digilocker | docs ready |
| WF-EDU-003 | School fee & academic calendar | Rc | P1 | school_portal, bbps | ★ specified |
| WF-EDU-004 | Scholarship discovery & application | Se | P2 | nsp | scholarships claimed |
| WF-EDU-005 | Exam registration & schedule | Se | P2 | board_portal | exams on track |
| WF-EDU-006 | Higher-education loan | Ev | P2 | bank_api | education financed |
| WF-EDU-007 | Study-abroad checklist (visa+forex+ins) | Ev | P2 | multi | abroad admission ready |
| WF-EDU-008 | Skill-course / certification tracking | Rc | P3 | — | upskilling tracked |
| WF-EDU-009 | Report-card & progress archive | Rc | P3 | school_portal | academic history kept |

### 4.9 TRVL — Travel & mobility
| ID | Name | L | P | Connectors | Outcome |
|----|------|---|---|-----------|---------|
| WF-TRVL-001 | Pre-trip passport-validity check | Ev | P0 | Twin | no denied boarding |
| WF-TRVL-002 | Visa application & tracking | Ev | P1 | vfs/embassy | visa obtained |
| WF-TRVL-003 | Travel insurance purchase | Ev | P2 | insurer_api | trip covered |
| WF-TRVL-004 | Forex / travel-card arrangement | Ev | P2 | bank_api | forex ready |
| WF-TRVL-005 | Itinerary & document bundle | Ev | P2 | — | trip organised |
| WF-TRVL-006 | FASTag recharge & toll tracking | Rc | P2 | netc_fastag | seamless tolls |
| WF-TRVL-007 | International SIM / roaming | Ev | P3 | telecom | connectivity abroad |
| WF-TRVL-008 | Frequent-flyer / loyalty tracking | Rc | P3 | — | points not lost |
| WF-TRVL-009 | Trip health prep (vaccines/meds) | Ev | P3 | abdm | health-ready travel |

### 4.10 HOME — Home & lifestyle
| ID | Name | L | P | Connectors | Outcome |
|----|------|---|---|-----------|---------|
| WF-HOME-001 | Utility onboarding (electricity/water/gas/broadband) | On | P1 | bbps | bills tracked |
| WF-HOME-002 | Recurring bills & autopay governance | Rc | P0 | bbps, upi | ★ specified |
| WF-HOME-003 | Subscription audit & cancellation | Rc | P1 | AA | wasteful subs cut |
| WF-HOME-004 | DTH/mobile/broadband recharge | Rc | P2 | bbps | connectivity continuous |
| WF-HOME-005 | Domestic-staff pay & compliance | Rc | P3 | upi | staff paid on time |
| WF-HOME-006 | Appliance warranty & AMC tracking | Rc | P3 | — | warranties honoured |
| WF-HOME-007 | Home-services scheduling | Ev | P3 | vendors | maintenance done |
| WF-HOME-008 | Grocery/essentials replenishment | Rc | P3 | — | household stocked |
| WF-HOME-009 | Pet care schedule (vet/vaccine) | Rc | P3 | — | pet health tracked |

### 4.11 LIFE — Life events & legal
| ID | Name | L | P | Connectors | Outcome |
|----|------|---|---|-----------|---------|
| WF-LIFE-001 | Marriage — full life-event orchestration | Ev | P1 | multi | name/nominee/address/policy all updated |
| WF-LIFE-002 | New-baby onboarding | Ev | P1 | crs, abdm | birth cert, ABHA, cover, corpus |
| WF-LIFE-003 | House-move orchestration | Ev | P1 | multi | address propagated, utilities moved |
| WF-LIFE-004 | Job-change transition | Ev | P1 | epfo | EPF transfer, insurance bridge, tax |
| WF-LIFE-005 | Will creation & storage | Ev | P1 | — | valid will secured |
| WF-LIFE-006 | Power-of-attorney setup | Ev | P2 | — | POA in place |
| WF-LIFE-007 | Retirement transition plan | Ev | P1 | epfo, nps_cra | pension + corpus + benefits |
| WF-LIFE-008 | Divorce/separation asset handling | Ev | P2 | multi | assets/records separated |
| WF-LIFE-009 | Guardianship for minor/dependent | Ev | P2 | — | guardianship documented |
| WF-LIFE-010 | Emergency "break-glass" family access | Cr | P0 | — | trusted access on crisis |
| WF-LIFE-030 | Bereavement, nominee claims & estate | Cr | P0 | multi | ★ specified |

### 4.12 FAM — Family ops & meta
| ID | Name | L | P | Connectors | Outcome |
|----|------|---|---|-----------|---------|
| WF-FAM-001 | Family onboarding & twin bootstrap | On | P0 | multi | ★ specified |
| WF-FAM-002 | Add a family member | Ev | P1 | — | member in Twin |
| WF-FAM-003 | Add/care for dependent parents | Ev | P1 | — | parents' obligations captured |
| WF-FAM-004 | Digital-twin hygiene & verification | Rc | P1 | multi | data fresh & verified |
| WF-FAM-005 | Preparedness-index review | Rc | P1 | — | readiness improving |
| WF-FAM-006 | Responsibility triage & prioritisation | Rc | P0 | — | right things first |
| WF-FAM-007 | Consent management & review | Rc | P0 | aa_consent | consents current, revocations honoured |
| WF-FAM-008 | Document-vault expiry sweep | Rc | P1 | — | nothing expires unnoticed |
| WF-FAM-009 | Annual family financial review | Se | P1 | AA | yearly health check |
| WF-FAM-010 | NRI family setup & compliance | On | P2 | bank_api | NRI-compliant ops |
| WF-FAM-011 | Trusted-contact & delegation setup | Ev | P1 | — | delegates configured |
| WF-FAM-012 | Data-export / account-portability (DPDP) | Ev | P1 | — | user owns their data |
| WF-FAM-013 | Decision-feedback capture & preference learning | Ev/Rc | P0 | — | AI learns from declined/modified suggestions |
| WF-FAM-014 | Trial start & autopay mandate setup | Ev | P0 | upi_mandate, enach, card_recurring | autopay scheduled before trial ends (`09 §3`) |
| WF-FAM-015 | Trial-end conversion / feature lock | Ev | P0 | mandate | auto-charge or gate paid features (`09 §3,§6`) |
| WF-FAM-016 | Plan change (upgrade/downgrade, proration) | Ev | P1 | mandate | plan switched, entitlements updated |
| WF-FAM-017 | Payment-failure dunning & recovery | Ev | P1 | mandate | involuntary churn recovered (`09 §4`) |
| WF-FAM-018 | Cancellation & win-back | Ev | P1 | — | clean exit, data retained (`09`,`10 §5`) |

---

## 5. Cross-workflow orchestration (life events fan out)

Big life events are **meta-workflows** that spawn and coordinate child workflows. Example —
**WF-LIFE-001 Marriage** fans out to: WF-GOV-011 (name change) · WF-GOV-010 (address) ·
WF-INV-014 / WF-INS-011 (nominee updates to spouse) · WF-INS-003 (health cover re-evaluation) ·
WF-FAM-002 (add spouse) · WF-TAX-006 (regime re-check) · WF-GOV-014 (marriage registration). The
Planner sequences them, respects dependencies (register marriage → then name change → then
propagate), and presents one consolidated approval surface.

## 6. Automation & approval gradient

Automation level per workflow rises with **trust** (Principle: *automation follows trust*):

| Level | Meaning | Example |
|-------|---------|---------|
| observe | watch & record | new user, all workflows start here |
| suggest | recommend, human executes | prepayment advice |
| assist | co-execute step-by-step | passport renewal |
| auto_with_approval | agent executes, human approves the mutating step | bill pay, renewal |
| auto | fully automated within Policy-Engine limits | small autopay under limit |

The Policy Engine enforces monetary limits, mandatory-approval categories (government filings,
money movement above threshold, health decisions), and per-family automation ceilings.

**Every decision is a learning signal (global rule).** Each workflow's decision/approval step
emits a `Suggestion` and records the outcome — accepted, modified, declined, or ignored — plus a
reason when one is available (volunteered, or requested via WF-FAM-013, or cautiously inferred).
Declines and modifications are first-class ground truth from the very first interaction: they feed
per-family `Preference`s applied immediately through retrieval, and a de-identified aggregate stream
that improves the models under evaluation governance (`04 §6`). A suggestion the user rejects "with
reason" teaches Saarthi faster than one silently accepted — so the loop is designed to make
declining cheap and, where valuable, to ask why.

## 7. Failure, fallback & escalation (global rules)

1. **No API → fallback ladder:** official API → partner/aggregator → authorised portal automation →
   pre-filled forms + guided manual → reminder-only. Every fallback is logged; the family always
   sees residual manual actions.
2. **Every mutating step is idempotent & checkpointed** (Temporal/Camunda) — safe to resume.
3. **Deadline guards:** time-critical workflows (renewals, filings, grace periods) escalate
   criticality and widen notification audience as the deadline nears.
4. **Human escalation** on ambiguity, disputes, or denied claims — never silently fail a
   responsibility.

## 8. Coverage ledger (toward 500–1,000)

| Domain | Indexed in v1.0 | Fully-specified ★ | Target range |
|--------|-----------------|-------------------|--------------|
| FIN | 20 | 1 | 60–90 |
| INV | 20 | 1 | 60–90 |
| INS | 24 | 3 | 70–110 |
| TAX | 12 | 1 | 40–60 |
| GOV | 22 | 3 | 70–110 |
| PROP | 12 | 1 | 40–70 |
| HLTH | 10 | 0 | 40–70 |
| EDU | 9 | 1 | 30–60 |
| TRVL | 9 | 0 | 30–50 |
| HOME | 9 | 1 | 30–60 |
| LIFE | 11 | 1 | 40–70 |
| FAM | 18 | 2 | 30–60 |
| **Total** | **176** | **15** | **540–900** |

The 176 indexed entries + the schema in §1 constitute the backlog; each is elaborated to
exemplar depth on prioritisation. The taxonomy (12 domains × 5 lifecycle lanes × per-member
instantiation across a family of 4–6) comfortably yields the 500–1,000 distinct runnable
workflows in the North-Star target without inventing filler — variants (per-member, per-asset,
per-institution) multiply the base catalog naturally.

---

### Open questions / v1.1 candidates
- Business-owner workflows (GST, payroll, MSME schemes) — deliberately thin in the family core.
- Regional/state-specific variants (property tax, PDS, marriage registration differ by state).
- Multi-family / HUF orchestration and shared-asset workflows.
