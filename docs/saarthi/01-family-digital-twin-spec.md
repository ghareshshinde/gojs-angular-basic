# Family Digital Twin (FDT) Specification — v1.0

> The Family Digital Twin is the **one source of truth**. Every service reads the Twin; no service
> owns a private copy of a family's reality. This document defines every entity, attribute,
> relationship, lifecycle state, and event.

## 1. Purpose & design principles

1. **Single source of truth.** All context — who is in the family, what they own, what they owe,
   what they must do — resolves to the Twin.
2. **Entity–Relationship–Event core.** The Twin is a property graph of typed **entities**, typed
   **relationships**, and an append-only **event** log. State is a projection of events.
3. **Bitemporal & non-destructive.** Facts are versioned on `valid_time` and `system_time`.
   Corrections supersede; they never erase. This is mandatory for financial, legal, and
   government correctness (e.g. "what did we believe her address was on the day we filed?").
4. **Consent-anchored.** Every externally-sourced attribute is traceable to the consent artifact
   that permitted its collection, and to the connector that fetched it.
5. **Sensitivity-classified by default.** Classification is an attribute-level property that drives
   encryption, masking, residency (India-region storage for regulated data), and access policy.
6. **Identity-resolved, not identity-assumed.** External identifiers are attributes with their own
   verification state; the Twin performs entity resolution rather than trusting any one key.

## 2. Meta-model

### 2.1 Object kinds

| Kind | Description |
|------|-------------|
| **Entity** | A noun with identity and lifecycle (a Person, a Bank Account, a Policy). |
| **Relationship** | A typed, directional, optionally time-bounded edge between two entities. |
| **Event** | An immutable fact that something happened at a point in time. State changes are events. |
| **Attribute** | A typed property on an entity or relationship, individually classified & consent-linked. |
| **Policy** | A rule governing what may be automated, who must approve, and what is disallowed. |
| **Responsibility** | A durable obligation the family owes the world (a recurring or one-off task with an owner, due date, and completion criteria). |
| **Goal** | A desired future state (corpus of ₹X by year Y) that responsibilities and workflows serve. |
| **Permission / Consent** | Who (person, agent, connector) may read/write/act on which entities. |

### 2.2 Common envelope (every entity carries)

```jsonc
{
  "id": "saarthi:person:6f0c…",        // stable URN, primary key
  "type": "Person",
  "family_id": "saarthi:family:9a…",   // partition / tenancy boundary
  "attributes": { /* typed, per-attribute metadata below */ },
  "lifecycle_state": "active",
  "labels": ["adult", "earning", "dependent_supporter"],
  "provenance": {
    "source": "connector:digilocker",   // or "user", "agent:planner", "derived"
    "consent_ref": "saarthi:consent:12…",
    "confidence": 0.98
  },
  "valid_time": { "from": "2019-04-01", "to": null },
  "system_time": { "from": "2026-07-31T10:11:00Z", "to": null },
  "sensitivity": "PII",
  "version": 7
}
```

### 2.3 Attribute metadata

Each attribute is not a bare value but a small record:

```jsonc
"pan": {
  "value": "ABCDE1234F",
  "sensitivity": "SENSITIVE_PII",
  "verification": { "state": "verified", "method": "digilocker", "at": "2026-06-02" },
  "source": "connector:digilocker",
  "consent_ref": "saarthi:consent:12…",
  "valid_time": { "from": "2010-07-01", "to": null }
}
```

Verification states: `unverified · self_declared · document_backed · source_verified · disputed · expired`.

## 3. Entity catalog

Entities are grouped by domain. For each: **key attributes**, **lifecycle states**, and **events
emitted**. Attribute type shorthand: `str, int, dec(money), date, ts, enum, ref<Type>, url, geo`.

### 3.1 People & household

#### `Person`
Central entity. A human the family cares for or about.

| Attribute | Type | Sensitivity | Notes |
|-----------|------|-------------|-------|
| `full_name`, `preferred_name` | str | PII | |
| `date_of_birth` | date | SENSITIVE_PII | drives age-based responsibilities (school, retirement, senior benefits) |
| `gender` | enum | PII | self-described |
| `pronouns` | str | PII | |
| `role_in_family` | enum | INTERNAL | self / spouse / child / parent / sibling / dependent / guardian / staff |
| `dependency_status` | enum | INTERNAL | independent / financially_dependent / caregiver / cared_for |
| `mobile`, `email` | str | PII | contact channels, each with verification state |
| `residential_address` | ref<Address> | PII | current; history retained bitemporally |
| `aadhaar_ref`, `pan_ref`, `passport_ref`, … | ref<Identity> | SENSITIVE_PII | pointers to Identity entities |
| `blood_group`, `known_allergies` | str/list | HEALTH | emergency-critical subset surfaced without deep auth |
| `is_primary_account_holder` | bool | INTERNAL | who "owns" the Saarthi tenancy |

**Lifecycle:** `prospective → active → dormant → deceased`. (`deceased` triggers Estate & nominee
workflows; never deletes — the Twin becomes the family's estate record.)

**Events:** `PersonAdded, PersonProfileUpdated, PersonMarkedDependent, PersonReachedMilestoneAge{age},
PersonDeceased, ContactVerified, ContactChanged`.

#### `Family` / `Household`
The tenancy and partition boundary. A `Family` may contain multiple `Household`s (e.g. NRI child
abroad, dependent parents in another city).

Key attributes: `name`, `primary_person`, `members[] (ref<Person>)`, `residence_addresses[]`,
`preparedness_index` (dec, derived), `trust_score` (dec, derived), `automation_level` (enum:
`observe → suggest → assist → auto_with_approval → auto`).
**Events:** `FamilyCreated, MemberJoined, MemberLeft, HouseholdSplit, PreparednessRecomputed`.

#### `Relationship` (entity form)
Family relationships rich enough to reason about (guardianship, nominee eligibility, dependency).
Attributes: `from`, `to`, `kind` (spouse / parent_of / child_of / guardian_of / sibling / nominee_of
/ dependent_of / power_of_attorney_for), `since`, `until`, `legal_document_ref`.

### 3.2 Identity & documents

#### `Identity`
A government / institutional identity credential.

| Attribute | Type | Sensitivity |
|-----------|------|-------------|
| `scheme` | enum (`aadhaar, pan, passport, driving_licence, voter_id, abha, ration_card, epfo_uan, nps_pran, ckyc`) | — |
| `number` (masked at rest) | str | SENSITIVE_PII |
| `holder` | ref<Person> | PII |
| `issued_on`, `valid_till` | date | PII |
| `issuing_authority`, `place_of_issue` | str | PII |
| `document_ref` | ref<Document> | — |
| `verification` | record | — |

**Lifecycle:** `pending_issue → active → expiring_soon → expired → revoked → superseded`.
**Events:** `IdentityLinked, IdentityVerified, IdentityExpiringSoon{days_left}, IdentityExpired,
IdentityRenewed, IdentityNumberChanged`.

#### `Document`
Any file-backed artifact (deed, policy PDF, marksheet, bill, will, medical report).
Attributes: `title`, `category`, `file_ref (MinIO/object URL)`, `mime`, `issued_by`, `issued_on`,
`expires_on`, `related_entities[]`, `ocr_text (indexed)`, `extracted_fields{}`, `hash`,
`is_original_available` (bool). **Sensitivity** inherited from category.
**Events:** `DocumentIngested, DocumentOCRCompleted, DocumentClassified, DocumentExpiringSoon,
DocumentSuperseded`.

#### `Address`
First-class because "update address everywhere" is a flagship workflow.
Attributes: `line1/2`, `city`, `state`, `pincode`, `geo`, `type` (residential/office/property),
`propagation_targets[]` (which connectors hold this address), `kyc_proof_ref`.
**Events:** `AddressAdded, AddressChanged, AddressPropagationRequested, AddressPropagatedTo{target}`.

### 3.3 Financial — assets

#### `FinancialAccount` (abstract → specialisations)
Specialisations: `BankAccount, CreditCard, DematAccount, MutualFundFolio, FixedDeposit,
RecurringDeposit, PPFAccount, EPFAccount, NPSAccount, Wallet, LoanAccount (see liabilities)`.
Common: `institution (ref<Institution>)`, `account_number (masked)`, `holders[] (+ joint mode)`,
`nominees[] (ref<Nominee>)`, `status`, `opened_on`, `balance (dec, as_of ts)`, `linked_via`
(connector / manual).

| Specialisation | Distinctive attributes |
|----------------|------------------------|
| `BankAccount` | `ifsc`, `branch`, `account_type` (savings/current), `is_salary_account`, `auto_debits[]` |
| `MutualFundFolio` | `amc`, `folio_no`, `schemes[] {scheme_code, units, nav, value}`, `sip_mandates[]` |
| `DematAccount` | `depository` (NSDL/CDSL), `dp_id`, `holdings[] {isin, qty, avg_cost, ltp}` |
| `FixedDeposit` | `principal`, `rate`, `maturity_date`, `auto_renew`, `payout_mode` |
| `PPFAccount`/`EPFAccount` | `uan`/`ppf_no`, `contributions[]`, `maturity/withdrawal_eligible_on` |
| `NPSAccount` | `pran`, `tier`, `scheme_preference`, `annuity_choice` |

**Lifecycle:** `active → dormant → matured → closed → frozen`.
**Events:** `AccountLinked, BalanceRefreshed, MaturityApproaching{days}, NomineeMissing,
InterestCredited, AccountDormant, AccountClosed`.

#### Physical assets: `Property`, `Vehicle`, `PreciousAsset`
- `Property`: `type` (flat/land/commercial), `address`, `ownership_share`, `purchase_value`,
  `current_value`, `loan_ref`, `khata/registration_no`, `property_tax_due`, `tenants[]`, `insurance_ref`.
  Events: `PropertyAdded, PropertyTaxDue, ValuationUpdated, RentDue, RegistrationRenewalDue`.
- `Vehicle`: `reg_no`, `make/model`, `purchase_date`, `rc_ref`, `insurance_ref`, `puc_valid_till`,
  `fastag_ref`, `loan_ref`, `service_due`. Events: `PUCExpiringSoon, InsuranceExpiringSoon,
  FastagLowBalance, ServiceDue, ChallanReceived`.
- `PreciousAsset`: gold/jewellery/collectibles — `description`, `weight`, `value`, `stored_at`,
  `insurance_ref`, `document_ref`.

### 3.4 Financial — liabilities & flows

- `LoanAccount`: `type` (home/auto/personal/education/gold/LAP), `lender`, `principal`,
  `outstanding`, `rate`, `emi_amount`, `emi_date`, `tenure_remaining`, `collateral_ref`,
  `foreclosure_terms`. Events: `EMIDue, EMIPaid, EMIMissed, RateChanged, ForeclosureEligible,
  LoanClosed, PrepaymentOpportunity`.
- `CreditCard` (as liability face): `limit`, `outstanding`, `due_date`, `min_due`, `reward_points`,
  `annual_fee_due`. Events: `StatementGenerated, PaymentDue, HighUtilisation, FeeWaiverEligible`.
- `Income`: `source` (salary/rent/business/dividend/interest/pension), `person`, `amount`,
  `frequency`, `next_expected`, `tax_treatment`.
- `Bill` / `Expense`: `payee (ref<Institution>)`, `category`, `amount`, `due_date`, `frequency`,
  `autopay_enabled`, `bbps_biller_id`, `account_id_at_biller`. Events: `BillFetched, BillDue,
  BillPaid, BillOverdue, BillAmountAnomaly`.
- `Subscription`: `merchant`, `plan`, `amount`, `renews_on`, `billing_instrument`, `cancellable_via`,
  `utilisation_signal`. Events: `RenewalUpcoming, PriceIncreased, UnusedSubscriptionDetected`.
- `TaxProfile`: per-person & per-family — `pan`, `regime`, `filing_status`, `assessment_year`,
  `form26AS_ref`, `AIS_ref`, `deductions[] {section, amount, proof_ref}`, `advance_tax_schedule`,
  `refund_status`. Events: `AdvanceTaxDue, FilingWindowOpen, TDSMismatchDetected, RefundReceived,
  NoticeReceived`.

### 3.5 Protection — insurance

#### `InsurancePolicy` (abstract → Life / Health / Motor / Home / Travel / Personal Accident)
Common: `insurer (ref<Institution>)`, `policy_number`, `product_name`, `policyholder`,
`insured[] (ref<Person>)`, `nominees[]`, `sum_assured/sum_insured (dec)`, `premium`,
`premium_frequency`, `start_date`, `renewal_date`, `status`, `agent_ref`, `document_ref`,
`claims[] (ref<Claim>)`.

| Type | Distinctive attributes |
|------|------------------------|
| `HealthPolicy` | `family_floater` (bool), `room_rent_limit`, `copay`, `sub_limits{}`, `PED_waiting_period`, `NCB`, `cashless_hospitals[]`, `TPA` |
| `LifePolicy` | `plan_type` (term/endowment/ULIP), `policy_term`, `premium_paying_term`, `maturity_value`, `surrender_value`, `riders[]` |
| `MotorPolicy` | `vehicle_ref`, `idv`, `ncb%`, `own_damage`/`third_party` split, `addons[]` |
| `HomePolicy` | `property_ref`, `structure_cover`, `contents_cover`, `perils[]` |

**Lifecycle:** `quoted → proposed → underwriting → active → grace_period → lapsed → renewed →
claim_in_progress → matured/surrendered/closed`.
**Events:** `PolicyIssued, RenewalDue{days}, PremiumPaid, EnteredGracePeriod, PolicyLapsed,
NomineeMissing, ClaimFiled, ClaimStatusChanged, ClaimSettled, FreeLookWindowClosing`.

#### `Claim`
`policy_ref`, `type` (cashless/reimbursement/death/maturity/motor_od/motor_tp), `intimated_on`,
`hospital/garage_ref`, `claimant`, `claimed_amount`, `approved_amount`, `documents[]`, `TPA_ref`,
`status`, `settlement_ref`, `grievance_ref`. Events: `ClaimIntimated, PreAuthRequested,
PreAuthApproved, DocumentsRequested, ClaimQueried, ClaimApproved, ClaimRejected, ClaimSettled,
GrievanceRaised`.

### 3.6 Health, education, government, lifestyle

- `HealthRecord`: `person`, `abha_ref`, `record_type` (prescription/lab/discharge/vaccination),
  `provider`, `date`, `document_ref`, `structured_data{}` (FHIR-aligned). Events: `RecordAdded,
  VaccinationDue, PrescriptionRefillDue, FollowUpDue`.
- `MedicalCondition` / `Medication`: chronic condition tracking for dependents (esp. seniors).
- `EducationRecord`: `student (ref<Person>)`, `institution`, `program`, `grade/year`, `fees[]`,
  `exam_schedule[]`, `scholarships[]`, `documents[]`. Events: `FeeDue, AdmissionWindowOpen,
  ExamUpcoming, ResultDeclared, ScholarshipDeadline`.
- `GovernmentBenefit` / `Scheme`: `scheme` (PMJAY, PM-Kisan, pension, subsidy), `eligible_members[]`,
  `enrolment_status`, `benefit_amount`, `renewal/recertification_due`. Events: `EligibilityDetected,
  EnrolmentDue, RecertificationDue, BenefitCredited`.
- `Travel`: `travellers[]`, `type` (domestic/intl), `visa_ref`, `passport_checks`, `insurance_ref`,
  `bookings[]`, `itinerary`. Events: `PassportValidityInsufficient, VisaExpiring, TripUpcoming,
  ForexNeeded`.
- `Institution` / `Provider`: banks, insurers, schools, hospitals, utilities, government bodies —
  the counterparties. `name`, `category`, `identifiers` (IFSC/IRDAI/biller_id/hospital_id),
  `connector_ref`, `support_channels`.
- `Nominee` / `Beneficiary`: `person`, `relationship`, `share%`, `on_asset (ref)`,
  `is_minor` (→ guardian required), `registered_on`, `verification`.

### 3.7 Orchestration entities

- `Responsibility`: the atomic unit of "running a family." `title`, `domain`, `owner (ref<Person>)`,
  `related_entities[]`, `due_date`, `recurrence`, `criticality` (low→critical), `state`
  (`identified → scheduled → in_progress → blocked → done → skipped → failed`), `workflow_ref`,
  `automation_eligible`. Events: `ResponsibilityIdentified, DueSoon, Completed, Missed, Escalated.`
- `Goal`: `title`, `type` (retirement/education/home/emergency_fund/vacation), `target_amount`,
  `target_date`, `funding_sources[]`, `progress`, `linked_responsibilities[]`.
- `WorkflowRun`: a live instance of a Workflow Catalog entry — `workflow_id`, `state`,
  `current_step`, `context{}`, `approvals[]`, `connector_calls[]`, `checkpoints[]`, `outcome`.
- `Consent`: `subject (ref<Person>)`, `purpose`, `data_scopes[]`, `granted_to` (agent/connector),
  `granted_at`, `expires_at`, `frequency` (AA fetch cadence), `artifact_ref` (DEPA consent artifact),
  `revocable`, `status`. Events: `ConsentRequested, ConsentGranted, ConsentDeclined, ConsentRevoked,
  ConsentExpired`.
- `Policy` (governance rule): `scope`, `condition`, `effect` (allow/deny/require_approval),
  `approver_role`, `monetary_limit`, `rationale`.
- `Suggestion`: a recommendation the AI presented and the human's response to it — the atomic unit
  of the learning loop. `agent`, `workflow_ref`/`responsibility_ref`, `recommended_action`,
  `rationale`, `confidence`, `alternatives[]`, `presented_at`, `status`
  (`pending → accepted | accepted_modified | declined | ignored | expired | superseded`),
  `decided_at`, `decided_by (ref<Person>)`, `modification` (what the user changed, if any). Every
  decision/approval step in a workflow produces one. **Events:** `SuggestionMade,
  SuggestionAccepted, SuggestionModified, SuggestionDeclined, SuggestionIgnored`.
- `DecisionFeedback`: why a suggestion was declined or modified (or, occasionally, why accepted).
  `suggestion_ref`, `reason_text`, `reason_code` (taxonomy: `not_now · already_handled · disagree ·
  too_costly · low_trust · privacy · wrong_context · prefer_alternative · other`),
  `reason_source` (`volunteered · prompted · inferred`), `sentiment`, `captured_at`. When a
  decline/modify has no volunteered reason, the system may **request lightweight feedback** (see
  WF-FAM-013) — sparingly, honouring Principle 6. **Events:** `FeedbackRequested, FeedbackProvided,
  FeedbackDeclined`.
- `Preference`: a *derived*, reversible statement of how this family/person wants Saarthi to behave,
  learned from `Suggestion`+`DecisionFeedback` history from the very first interaction. `subject`
  (family/person), `scope` (domain/workflow/counterparty/action-class), `statement`
  (e.g. "always review before any payment > ₹5,000", "declines insurer-X upsells"), `strength`
  (dec, grows with corroborating signals), `derived_from[] (ref<Suggestion>)`, `valid_time`,
  `revocable` (always true — a preference is applied via retrieval, never baked into a model).
  **Events:** `PreferenceLearned, PreferenceStrengthened, PreferenceApplied, PreferenceOverridden,
  PreferenceExpired`.

### 3.8 Platform, access & commerce entities

These make the platform operable, secure, and monetisable. They are part of the Twin but governed
by their own specs — access (`08`), billing (`09`), security (`10`).

**Identity & access**
- `UserAccount`: an authentication principal — *distinct from `Person`*. A `Person` may have zero
  logins (a dependent child/parent tracked but not logging in) or one `UserAccount`. Attributes:
  `person_ref`, `login_identifiers` (mobile/email/passkey), `auth_factors[]`, `status`
  (`invited → active → locked → suspended → closed`), `last_login`, `persona` (drives the
  persona-wise experience — see `08`). Events: `AccountInvited, AccountActivated, LoginSucceeded,
  LoginFailed, StepUpChallenged, AccountLocked`.
- `Role`: named capability bundle (`family_admin · adult_member · caregiver · dependent_view ·
  delegate · advisor · support_agent · system`). `Permission`/`Grant`: subject → action → resource
  scope (ABAC predicate over FDT entities), with `condition` and `expires_at`.
- `Delegation`: time-bounded transfer of specific capabilities (POA, break-glass, caregiver access)
  — `from`, `to`, `scope`, `reason`, `valid_time`, `revocable`. Ties to `POA_FOR` relationship.
- `Session`: `account_ref`, `device`, `started_at`, `expires_at`, `auth_level` (aal1/aal2/step-up),
  `risk_score`. `Credential` material lives only in the secrets vault, never here.

**Commerce & entitlement** (note: distinct from the family's *external* `Subscription` entity in
§3.4 — that models Netflix-style third-party subscriptions; the entities below model the family's
paid relationship *with Saarthi*).
- `Plan`: a Saarthi offering — `tier` (`free · premium_family · …`), `billing_cycle`
  (`monthly · annual`), `price`, `features[]`, `trial_length`, `region`. Catalog-versioned.
- `Membership`: the family's active plan state — `family_ref`, `plan_ref`, `status`
  (`trialing → active → past_due → grace → locked → cancelled → expired`), `trial_ends_at`,
  `current_period_end`, `payment_mandate_ref`, `renewal_mode`. Events: `TrialStarted,
  TrialEndingSoon, TrialConverted, TrialExpiredLocked, Renewed, PaymentFailed, EnteredGrace,
  MembershipLocked, Cancelled`.
- `Entitlement`: the resolved, cached answer to "can this family use feature X right now?" —
  `family_ref`, `feature`, `state` (`granted · trial · gated · revoked`), `source_membership`,
  `valid_time`. The single point feature-gating reads (see `09`).
- `PaymentMandate`: a pre-authorised autopay instrument — `type` (`upi_autopay · e_nach ·
  card_recurring`), `provider`, `max_amount`, `frequency`, `mandate_ref`, `status`
  (`pending → active → paused → revoked`), `set_up_at`. Enables scheduling autopay *before* the
  trial ends. **Sensitivity:** `FINANCIAL`; card PAN is never stored (tokenised via a PCI-scoped
  provider — see `10`). Events: `MandateRequested, MandateActive, MandateDebited, MandateFailed,
  MandateRevoked`.
- `Invoice` / `Payment`: `membership_ref`, `amount`, `tax (GST)`, `period`, `status`, `receipt_ref`.

## 4. Relationship model

Relationships are typed edges; the graph is the substrate for GraphRAG and the Planner's reasoning.

| Relationship | From → To | Notes |
|--------------|-----------|-------|
| `MEMBER_OF` | Person → Family | with role |
| `SPOUSE_OF`, `PARENT_OF`, `GUARDIAN_OF`, `DEPENDENT_OF`, `POA_FOR` | Person → Person | time-bounded |
| `OWNS` / `CO_OWNS` | Person → Asset | with share% |
| `OWES` | Person → LoanAccount | |
| `NOMINEE_ON` | Person → Asset/Policy | with share% |
| `INSURES` | InsurancePolicy → Person/Asset | |
| `COVERS` | InsurancePolicy → MedicalCondition/Peril | |
| `SECURED_BY` | LoanAccount → Asset | collateral |
| `HELD_AT` | Account/Policy → Institution | |
| `HAS_IDENTITY` | Person → Identity | |
| `EVIDENCED_BY` | any → Document | |
| `SERVES` | Responsibility → Goal | |
| `FULFILLED_BY` | Responsibility → WorkflowRun | |
| `AUTHORISED_BY` | ConnectorCall → Consent | |
| `LIVES_AT` | Person/Household → Address | current + history |

## 5. Event model

### 5.1 Envelope

```jsonc
{
  "event_id": "evt_…",
  "type": "RenewalDue",
  "family_id": "saarthi:family:9a…",
  "subject": "saarthi:policy:health:44…",
  "occurred_at": "2026-07-31T00:00:00Z",   // valid_time
  "recorded_at": "2026-07-31T02:00:11Z",    // system_time
  "producer": "connector:cams | agent:insurance | rule:renewal-scan",
  "payload": { "days_left": 21, "premium": 24500 },
  "consent_ref": "saarthi:consent:12…",
  "causation_id": "evt_… (what caused this)",
  "correlation_id": "run_… (which workflow run)"
}
```

### 5.2 Event taxonomy (top level)

`Lifecycle.*` (state transitions) · `Temporal.*` (DueSoon / Expiring / Maturing) ·
`Financial.*` (Credited / Debited / BalanceChanged) · `Compliance.*` (FilingWindow / NoticeReceived) ·
`Risk.*` (CoverageGap / NomineeMissing / Overdue) · `Consent.*` · `Connector.*` (Fetched / Failed /
AuthExpired) · `Workflow.*` (Started / StepCompleted / ApprovalRequested / Completed / Failed) ·
`Decision.*` (SuggestionMade / Accepted / Modified / Declined / Ignored) · `Learning.*`
(FeedbackRequested / FeedbackProvided / PreferenceLearned / PreferenceApplied).

The `Decision.*` and `Learning.*` streams are the substrate of the continuous-learning loop
(`04 §6`): declined and modified suggestions — with their reasons — are ground-truth signal from
the first interaction onward.

The **event log is the system of record**; the property graph (Neo4j/Memgraph) and relational
store (PostgreSQL) are projections rebuildable from it. Kafka/Redpanda is the transport.

## 6. Lifecycle state machines (canonical)

- **Identity/Document:** `active → expiring_soon(T-90/30/7) → expired → renewed(→active)`.
- **Insurance:** `active → renewal_due(T-45/30/7) → grace_period → lapsed | renewed`.
- **Responsibility:** `identified → scheduled → in_progress → (blocked ↔ in_progress) → done | missed`.
- **Person:** `active → deceased` fans out to Estate, Nominee-claim, Subscription-cancellation,
  and Benefit-transfer workflows.

State transitions are **events**, and derived metrics (`preparedness_index`, `trust_score`) are
projections over them.

## 7. Data classification, consent & residency

| Class | Examples | At rest | Access |
|-------|----------|---------|--------|
| `SENSITIVE_PII` | Aadhaar, passport no. | Field-level encryption, tokenised, India-region | consent + step-up auth |
| `FINANCIAL` | balances, holdings | Encrypted, India-region | consent (AA) scoped |
| `HEALTH` | ABHA records, conditions | Encrypted, India-region, ABDM consent | explicit health consent |
| `CREDENTIAL` | connector tokens | Secrets vault (never in graph) | service-only |
| `PII` | name, contact, address | Encrypted | family + granted agents |

Every regulated attribute stores `consent_ref`; on consent revocation, dependent attributes are
tombstoned (masked, retained per legal minimums, excluded from processing) — honouring DPDP's
right to erasure without breaking the bitemporal audit trail.

## 8. Identity resolution & deduplication

Because the same asset can arrive from multiple connectors (a bank account from the AA feed *and*
from a statement upload), the Twin runs entity resolution:
- **Deterministic keys** first (IFSC+account_no, ISIN+folio, policy_number+insurer).
- **Probabilistic match** (name/DOB/masked-number fuzzy) proposes merges above threshold; below it,
  a `PersonReview`/`AssetReview` responsibility is raised for human confirmation.
- Merges are **reversible events** (`EntitiesMerged` / `MergeReverted`), never destructive.

## 9. Worked example (abridged)

```jsonc
// Rahul's family — a fragment showing entities + edges + a derived responsibility
{ "id":"saarthi:person:rahul", "type":"Person", "role_in_family":"self", "date_of_birth":"1994-02-11" }
{ "id":"saarthi:person:parent1","type":"Person","role_in_family":"parent","dependency_status":"cared_for" }
{ "id":"saarthi:policy:health:44","type":"HealthPolicy","family_floater":true,
  "insured":["saarthi:person:rahul","saarthi:person:parent1"],"renewal_date":"2026-08-21",
  "nominees":[] }
// edges
{ "from":"saarthi:person:rahul","kind":"DEPENDENT_OF-inverse:supports","to":"saarthi:person:parent1" }
{ "from":"saarthi:policy:health:44","kind":"INSURES","to":"saarthi:person:parent1" }
// events → responsibilities
RenewalDue{ subject: policy:health:44, days_left: 21 }   →  Responsibility{
   title:"Renew parents' health cover", domain:"insurance", owner:"person:rahul",
   criticality:"high", due_date:"2026-08-21", workflow_ref:"WF-INS-004" }
RiskDetected NomineeMissing{ subject: policy:health:44 } →  Responsibility{
   title:"Add nominee to health policy", criticality:"medium", workflow_ref:"WF-INS-011" }
```

---

### Open questions / v1.1 candidates
- Cross-family relationships (shared assets between separated households, HUF entities).
- Business-owner entities (firm, GSTIN, employees) — currently out of the family core, referenced.
- Formalising `preparedness_index` / `trust_score` computation (own spec).
