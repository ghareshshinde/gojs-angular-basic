# Connector Registry — v1.0

> Every workflow step ultimately touches an external system. This registry catalogues each planned
> integration — its **API availability, consent model, regulatory constraints, authentication, and
> fallback strategy** — so the Connector Platform, Consent Engine, and Security teams build against
> reality, not optimism. Principle: **Integrate, don't recreate.**

**How to read this.** Each connector is one row/record in the registry, keyed by the `id` used in
the Workflow Catalog's `connectors:` field. Where no programmatic API exists, the registry
prescribes the **fallback ladder**; a workflow is never blocked solely because an API is missing.

---

## 1. Connector schema

```yaml
id:            stable slug used across catalog + code
provider:      owning body / company
category:      india_stack | banking | investments | insurance | tax | government |
               health | education | utilities | telecom | travel | identity | infra
capabilities:  [read, write, notify, authenticate, pay, fetch_document]
api:
  availability: official | partner_gated | aggregator | portal_only | none
  protocol:     REST | SOAP | ISO8583/NPCI | FHIR | file/SFTP | screen | n/a
  sandbox:      yes | limited | no
auth:          oauth2 | api_key+hmac | mutual_tls | aa_token | ekyc | esign | portal_login | none
consent_model: depa_aa | abdm_consent | digilocker_consent | explicit_user | mandate(e-nach/upi) |
               none_required | portal_delegated
data_scopes:   [what data flows, tied to FDT entities]
fdt_entities:  [entities this connector populates/mutates]
regulatory:    governing bodies + key constraints
constraints:   rate limits, aggregator licensing, data-localisation, expiry of tokens
fallback:      ordered ladder when api.availability != official/usable
status:        planned | in_discovery | building | live
priority:      P0 (Phase-1) | P1 | P2 | P3
```

### Global fallback ladder (applies to every connector)
`official API → partner/aggregator API → authorised-portal automation (RPA) →
pre-filled forms + guided manual → document upload + OCR extraction → reminder-only`.
Each rung is logged with provenance; the family always sees what remains manual.

### Cross-cutting consent architecture
- **DEPA / Account Aggregator** governs *financial* data pulls — a signed **consent artifact**
  (purpose, scope, frequency, expiry) precedes every fetch; revocable any time.
- **ABDM consent** governs *health* records via the consent-manager (HIU/HIP model).
- **DigiLocker consent** governs issued-document access (scoped, per-doc).
- **DPDP Act** is the umbrella: notice, purpose limitation, data-principal rights (access, erasure,
  portability), India-region storage for regulated classes. Every connector maps its pull to a
  DPDP purpose and a `consent_ref` written into the FDT.

---

## 2. India Stack & national infrastructure

| ID | Provider | Capabilities | API avail. | Auth | Consent | Regulatory | Fallback | Pri |
|----|----------|--------------|-----------|------|---------|-----------|----------|-----|
| `account_aggregator` | RBI-licensed AAs (Finvu, Setu, OneMoney, CAMSfinserv) | read financial data | aggregator | aa_token | **depa_aa** | RBI AA Master Directions, DEPA | statement upload + OCR | **P0** |
| `aadhaar_ekyc` | UIDAI (via KUA/AUA/eKYC partner) | authenticate, ekyc | partner_gated | ekyc/OTP | explicit_user | Aadhaar Act §57, UIDAI regs, no storage of raw Aadhaar | offline XML / masked upload | **P0** |
| `uidai_selfservice` | UIDAI (SSUP) | update demographic/mobile | portal_only | OTP | explicit_user | UIDAI update rules | guided-manual at enrolment centre | P1 |
| `digilocker` | MeitY | fetch issued docs, push | official | oauth2 | **digilocker_consent** | DigiLocker/IT Act rules | document upload | **P0** |
| `upi` | NPCI (via PSP/PA-PG) | pay, collect, mandate | partner_gated | app+UPI PIN | mandate/explicit | NPCI UPI, RBI PA/PG | net-banking/card | **P0** |
| `bbps` | NPCI Bharat BillPay (via BBPOU) | fetch bills, pay | partner_gated | api_key+hmac | mandate/explicit | NPCI BBPS, RBI | biller portal / manual | **P0** |
| `netc_fastag` | NPCI NETC (issuer bank) | balance, recharge, toll | partner_gated | api_key | mandate/explicit | NPCI NETC | issuer app | P1 |
| `income_tax_eportal` | Income Tax Dept | file, verify, pay, status | portal_only | portal_login/Aadhaar-OTP | explicit_user | IT Act; no auto-file w/o e-verify | guided-manual | **P0** |
| `income_tax_ais` | Income Tax Dept (AIS/TIS) | read income/TDS | portal_only | portal_login | explicit_user | IT Act | 26AS/Form-16 upload | P1 |
| `form26AS` | TRACES/NSDL | read TDS | portal_only | portal_login | explicit_user | IT Act | statement upload | P1 |
| `gstn` | GSTN (via GSP) | file GST, read | partner_gated | api_key+otp | explicit_user | CGST rules | portal-manual | P2 |
| `epfo` | EPFO (UAN) | passbook, transfer, claim | portal_only | UAN/OTP | explicit_user | EPF Act | passbook upload / UMANG | P1 |
| `nps_cra` | Protean/KFin CRA | contribute, statement, claim | partner_gated | portal/OTP | explicit_user | PFRDA | portal-manual | P2 |
| `passport_seva` | MEA (PSP) | apply, appointment, status | portal_only | portal_login | explicit_user | Passport Act | guided-manual | **P0** |
| `parivahan` | MoRTH (Vahan/Sarathi) | DL, RC, challan | portal_only | portal/OTP | explicit_user | MV Act | guided-manual | P1 |
| `parivahan_echallan` | MoRTH | read/pay challan | portal_only | reg-no lookup | none/explicit | MV Act | manual | P2 |
| `abdm` | NHA (ABHA/HIE-CM) | health-record exchange | official | abha+consent | **abdm_consent** | ABDM, DPDP-health | manual record upload | P1 |
| `pmjay` | NHA (Ayushman) | eligibility, enrol | portal_only | portal/OTP | explicit_user | PM-JAY scheme rules | CSC/guided | P1 |
| `umang` | NeGD | multi-service gateway | partner_gated | mobile/OTP | explicit_user | MeitY | per-service portal | P2 |
| `myscheme` | NeGD | scheme discovery/eligibility | official-ish | none | none_required | — | manual rules engine | P1 |
| `nsdl_pan` | Protean/UTIITSL | PAN apply/correct | portal_only | portal | explicit_user | IT Act | guided-manual | P1 |
| `crs` | Registrar of Births & Deaths | birth/death cert | portal_only (state) | portal | explicit_user | RBD Act | municipal-office guided | P1 |
| `jeevan_pramaan` | MeitY | digital life certificate | official | aadhaar-biometric | explicit_user | pension rules | bank/CSC guided | P2 |
| `ckyc` | CERSAI CKYCR | central KYC record | partner_gated | api_key | explicit_user | PMLA/CKYC | per-institution KYC | P1 |
| `kra` | SEBI KRAs (CVL/NDML/CAMS/Karvy) | securities KYC | partner_gated | api_key | explicit_user | SEBI KYC | per-RTA KYC | P1 |
| `esign` | CCA-licensed ESPs | aadhaar e-sign | partner_gated | aadhaar-OTP | explicit_user | IT Act §3A | wet-sign upload | P2 |
| `eci` | Election Commission | voter reg/update | portal_only | portal/OTP | explicit_user | RP Act | guided-manual | P3 |
| `iepf` | IEPF Authority | unclaimed assets search/claim | portal_only | portal | explicit_user | Companies Act | guided-manual | P2 |

**Future India-Stack rails (in_discovery):** `ondc` (commerce), `ocen` (credit — lender/LSP flows),
`bima_sugam` (insurance marketplace — expected to unify quote/renew/claim/portability and replace
much insurer-specific scraping). Design connectors so these can subsume private fallbacks later.

---

## 3. Banking & payments

| ID | Provider | Capabilities | API avail. | Auth | Consent | Fallback | Pri |
|----|----------|--------------|-----------|------|---------|----------|-----|
| `bank_api` (per-bank) | HDFC/ICICI/SBI/Axis/Kotak… | read, pay, mandate, statement | partner_gated (co-lending/OB pilots) or none | oauth2/mutual_tls | depa_aa (read) / mandate (write) | **AA for read**; e-NACH/UPI-mandate for write; statement OCR | P0 |
| `upi_mandate` | NPCI + PSP | recurring e-mandate | partner_gated | UPI PIN | mandate | e-NACH | P0 |
| `enach` | NPCI e-NACH | recurring debit setup | partner_gated | net-banking/debit-card | mandate | physical NACH | P1 |
| `credit_bureau` | CIBIL/Experian/CRIF/Equifax | credit score/report | partner_gated | api_key+consent | explicit_user | consumer-portal pull | P2 |
| `card_networks` | via issuer | statement, rewards | none (issuer) | portal | explicit_user | statement OCR / AA | P2 |

> **Reality note.** India lacks a universal open-banking write API. Saarthi reads via **AA** and
> writes via **NPCI mandates (UPI/e-NACH)** and **BBPS**; direct per-bank APIs are opportunistic
> partnerships. This is why the Workflow Catalog leans on `account_aggregator`, `upi`, `bbps`.

---

## 4. Investments

| ID | Provider | Capabilities | API avail. | Auth | Consent | Fallback | Pri |
|----|----------|--------------|-----------|------|---------|----------|-----|
| `cams` | CAMS (RTA) | MF holdings, transact, CG statement | partner_gated | api_key/OTP | explicit_user/aa | CAS email + AA | P0 |
| `kfintech` | KFin (RTA) | MF holdings, transact | partner_gated | api_key/OTP | explicit_user/aa | CAS + AA | P0 |
| `mf_central` | CAMS+KFin JV | unified MF servicing | official-ish | OTP | explicit_user | per-RTA | P1 |
| `cdsl` / `nsdl` | Depositories | demat holdings (CAS) | partner_gated (via DP) | api_key | explicit_user/aa | CAS eCAS + AA | P1 |
| `bse_star` / `nse_mfss` | exchanges | MF order routing | partner_gated | member API | mandate | broker platform | P2 |
| `broker_api` | Zerodha/Groww/etc. | equity holdings/orders | partner_gated | oauth2 | explicit_user | AA / contract-note parse | P2 |

---

## 5. Insurance

| ID | Provider | Capabilities | API avail. | Auth | Consent | Regulatory | Fallback | Pri |
|----|----------|--------------|-----------|------|---------|-----------|----------|-----|
| `insurer_api` (per-insurer) | LIC/HDFC Life/ICICI Lombard/Star/… | quote, renew, policy fetch, claim | partner_gated (broker/POSP) or portal_only | api_key/oauth2/portal | explicit_user | IRDAI product/claim rules, free-look | portal RPA → policy PDF OCR | P0 |
| `tpa_api` (per-TPA) | Medi Assist/Health India/… | pre-auth, cashless, claim status | partner_gated | api_key | explicit_user | IRDAI TPA regs | hospital-desk assist | P0 |
| `bima_sugam` | IRDAI (upcoming) | unified quote/renew/claim/port | in_discovery | tbd | explicit_user | IRDAI | current insurer/TPA connectors | P1 |
| `ombudsman` | Insurance Ombudsman | grievance filing | portal_only | portal | explicit_user | IRDAI grievance | Bima Bharosa portal / manual | P1 |
| `irdai_pos` | Broker/aggregator (POSP) | multi-insurer quote/issue | partner_gated | api_key | explicit_user | IRDAI intermediary | direct insurer | P1 |

> Insurance is **portal-heavy** today; RPA + document intelligence carry much of the load until
> **Bima Sugam** matures. The registry models per-insurer/per-TPA connectors so they can be
> retired behind Bima Sugam without touching workflows.

---

## 6. Health, education, utilities, telecom, travel

| ID | Category | Provider | API avail. | Auth | Consent | Fallback | Pri |
|----|----------|----------|-----------|------|---------|----------|-----|
| `provider_ehr` | health | Hospitals/clinics (FHIR/ABDM HIP) | official (ABDM) / none | abha | abdm_consent | manual report upload | P1 |
| `cowin_abdm_immunise` | health | NHA | official | abha/OTP | abdm_consent | manual card | P1 |
| `lab_api` | health | Diagnostic chains | partner_gated | api_key | explicit_user | report upload + OCR | P2 |
| `pharmacy_api` | health | 1mg/PharmEasy/Netmeds | partner_gated | oauth2 | explicit_user | manual reminder | P2 |
| `school_portal` (per-school) | education | Schools/ERP (varies) | portal_only/none | portal_login | explicit_user | manual + fee via BBPS | P1 |
| `nsp` | education | National Scholarship Portal | portal_only | portal/OTP | explicit_user | guided-manual | P2 |
| `board_portal` | education | CBSE/state boards | portal_only | portal | explicit_user | manual | P2 |
| `utility_biller` | utilities | Discoms/water/gas boards | via **bbps** | — | mandate | biller portal | P0 |
| `broadband_dth` | utilities | ISPs/DTH | via **bbps**/app | portal | mandate | app recharge | P2 |
| `telecom_api` | telecom | Jio/Airtel/Vi | partner_gated/app | portal/OTP | explicit_user | app/manual | P2 |
| `vfs_embassy` | travel | VFS/embassies | portal_only | portal | explicit_user | guided-manual | P1 |
| `oem_service` | mobility | Auto OEM service | partner_gated/app | app | explicit_user | reminder + booking assist | P2 |
| `municipal_tax` | government | ULB portals (per-city) | portal_only | portal | explicit_user | guided-manual | P1 |

---

## 6A. Discovery ingestion channels (email & SMS) — *primary net-worth discovery*

The INDmoney-style magic: auto-discover accounts, transactions, bills, CAS statements, warranties,
and orders by parsing the user's inbox and messages. This is a **primary channel**, complementary
to Account Aggregator — it finds what AA/DigiLocker don't, and bootstraps net worth fast.

| ID | Source | Capabilities | API avail. | Auth | Consent | Regulatory / privacy | Fallback | Pri |
|----|--------|--------------|-----------|------|---------|----------------------|----------|-----|
| `email_ingest` | Gmail / Outlook / IMAP | read + classify txn/bill/CAS/warranty/order mail | official (Gmail/Graph API) | oauth2 (**restricted scopes**) | explicit_user | Google **CASA security assessment** for restricted scopes; DPDP purpose-limit; read-minimal, no full-mailbox retention | forward-to-address / manual upload | **P0** |
| `sms_ingest` | on-device SMS (mobile app) | read financial/OTP-excluded SMS on-device | OS permission | device consent | explicit_user | on-device parsing preferred; **no OTP capture**; DPDP | manual entry | **P0** |
| `cas_parse` | CAMS/KFin/NSDL/CDSL **CAS** via email | parse consolidated account statements | file/email | user-forwarded | explicit_user | — | AA / portal | P1 |

> **Privacy stance.** Email/SMS are `SENSITIVE`-adjacent. We parse for financial signal only,
> minimise retention (store extracted facts + provenance, not whole mailboxes), never read OTPs, and
> bind processing to an explicit purpose — see `10 §3`. On-device SMS parsing avoids server-side
> message storage entirely where possible.

## 6B. Investing — account opening & new instruments

Beyond *import*: open accounts and transact. This makes Saarthi a **distributor/intermediary** —
see the licensing posture in `6E` and `10 §8`.

| ID | Category | Capabilities | API avail. | Auth | Regulatory | Pri |
|----|----------|--------------|-----------|------|-----------|-----|
| `mf_onboarding` | MF account opening & transact | eKYC, folio creation, purchase/redeem/SIP | partner_gated | ekyc/oauth2 | **AMFI ARN** distributor / SEBI RIA (advice) | P1 |
| `broker_onboarding` | Demat+trading account opening | KYC, account open, order routing | partner_gated | ekyc | SEBI stock-broker or intro/partner | P2 |
| `us_stocks_custodian` | US/international equity | account, LRS remittance, trade, tax docs | partner_gated | oauth2 | **RBI LRS**, foreign-asset (Schedule FA) tax | P2 |
| `sif_amc` | Specialized Investment Fund | eligibility, subscribe/redeem | partner_gated | ekyc | SEBI SIF framework | P2 |
| `bonds_sgb_gold` | bonds / SGB / digital gold | buy/sell, holdings | partner_gated | oauth2 | SEBI/RBI | P2 |
| `fd_platform` | FDs via partners | book/close FD | partner_gated | oauth2 | RBI/DICGC | P2 |

## 6C. Lending & credit

| ID | Category | Capabilities | API avail. | Auth | Regulatory | Pri |
|----|----------|--------------|-----------|------|-----------|-----|
| `lending_lsp` | quick personal loan / credit line | eligibility, apply, disburse | partner_gated | oauth2+consent | **RBI Digital Lending**; NBFC or **OCEN LSP** role | P2 |
| `lamf` | loan against MF/securities | pledge units, sanction, disburse | partner_gated | ekyc | RBI; depository pledge | P2 |
| `credit_line_bnpl` | short-term credit | offer, draw, repay | partner_gated | oauth2 | RBI | P3 |

## 6D. Advisory & consultation marketplace

Human experts in the loop — the "live doctor / CA / advisor" surface.

| ID | Category | Capabilities | API avail. | Auth | Regulatory | Pri |
|----|----------|--------------|-----------|------|-----------|-----|
| `telemedicine` | live doctor consult | booking, video, e-prescription | partner_gated | oauth2 | Telemedicine Practice Guidelines; ABDM link | P2 |
| `ca_advisor_network` | CA / tax expert consult | booking, doc share, filing assist | partner_gated | oauth2 | ICAI norms; consent for doc share | P2 |
| `financial_advisor` | SEBI RIA advice | risk-profiling, advice, plans | partner_gated | oauth2 | **SEBI RIA** (advice vs distribution boundary) | P2 |
| `health_checkup` | preventive checkup booking | slots, home-collection, reports→ABDM | partner_gated | oauth2 | lab norms; ABDM consent | P2 |

## 6E. Regulated-entity / licensing posture *(structural decision — see `10 §8`, `05 §11`)*

Offering the above turns Saarthi from a *read-only aggregator* into a *regulated intermediary*.
The registry flags, per capability, the licence/partnership required so this is a deliberate
business decision, not an accident:

- **Advice** → **SEBI RIA** (fee-only advice) — kept separate from distribution to avoid conflict.
- **MF distribution** → **AMFI ARN**; **broking** → SEBI stock-broker or a partner-broker model.
- **Lending** → own **NBFC** or act as an **OCEN LSP / DLG partner** under RBI Digital Lending rules.
- **Insurance** → **IRDAI** corporate agent / broker / POSP.
- **US investing** → RBI **LRS** compliance + partner custodian.
- **Account Aggregator / payments** → operate via licensed AAs / PA-PG partners (already in `§2–3`).

Default posture: **partner-first** (integrate licensed partners) and acquire own licences where
economics/control justify it. This keeps the platform lawful at every phase (`06 §5`).

## 7. AI, infra & internal connectors

Not external integrations but the platform substrate the connectors run on (from the AI-architecture
blueprint) — listed so the registry is complete:

| ID | Role | Choice |
|----|------|--------|
| `model_gateway` | route to LLMs, no lock-in | LiteLLM in front of GLM/Qwen/Llama/DeepSeek/Gemma; vLLM self-host, Ollama for dev |
| `orchestration` | long-running, checkpointed, human-approval workflows | Temporal / Camunda, wrapped behind Saarthi's own interface |
| `agent_graph` | planner + 12 domain agents | LangGraph-style, behind Saarthi orchestration API |
| `graph_store` | Knowledge Graph / FDT graph projection | Neo4j / Memgraph |
| `system_of_record` | relational + event store | PostgreSQL, pgvector; Kafka/Redpanda events |
| `object_store` | documents | MinIO |
| `search` | keyword + semantic | OpenSearch + pgvector; GraphRAG over graph_store |
| `ocr` | document intelligence | Docling / PaddleOCR / Tesseract |
| `secrets_vault` | connector credentials (never in graph) | Vault-class secrets manager |
| `observability` | traces/metrics/LLM eval | OpenTelemetry, Prometheus/Grafana/Jaeger, Langfuse/Phoenix |

---

## 8. Consent, auth & regulatory summary

| Data domain | Primary consent rail | Auth | Storage residency | Key regulator |
|-------------|----------------------|------|-------------------|---------------|
| Financial (accounts, MF, deposits) | **DEPA / Account Aggregator** artifact | aa_token | India-region | RBI/SEBI |
| Identity & documents | **DigiLocker** consent / eKYC | oauth2 / OTP | India-region, tokenised | UIDAI/MeitY |
| Health records | **ABDM** consent-manager | abha | India-region | NHA/DPDP |
| Insurance | explicit_user (→ Bima Sugam) | portal/api_key | India-region | IRDAI |
| Tax | explicit_user, no auto-file | portal/Aadhaar-OTP | India-region | CBDT |
| Government services | explicit_user per portal | portal/OTP | India-region | respective ministry |
| **Umbrella** | **DPDP Act** — notice, purpose limitation, rights, erasure/portability | — | India-region for regulated classes | DPB India |

**Non-negotiables encoded for every connector:**
1. A pull happens only against a live `consent_ref`; revocation stops future pulls and tombstones
   dependent data.
2. Credentials live only in the secrets vault, never in the FDT graph.
3. Every mutating call (pay, file, update) requires the workflow's human-approval gate.
4. Full audit trail: who/what/when/under-which-consent for every connector call
   (`AUTHORISED_BY → Consent` edge in the FDT).

---

## 9. Connector build priority (Phase 1)

**P0 — build first (unlock the P0 workflow spine):** `account_aggregator`, `digilocker`,
`aadhaar_ekyc`, `upi`, `bbps`, `income_tax_eportal`, `passport_seva`, `cams`, `kfintech`,
`insurer_api`, `tpa_api`, `bank_api (read via AA)`, `secrets_vault`, `ocr`, `model_gateway`.

**P1 — fast follow:** `abdm`, `epfo`, `parivahan`, `uidai_selfservice`, `ckyc`/`kra`, `nsdl_pan`,
`crs`, `cdsl`/`nsdl`, `municipal_tax`, `netc_fastag`, `school_portal`, `myscheme`, `pmjay`.

**P2/P3 — later or fallback-first:** `gstn`, `nps_cra`, `broker_api`, `telecom_api`, `nsp`,
`board_portal`, `eci`, `iepf`, `jeevan_pramaan`, plus the emerging `bima_sugam`/`ondc`/`ocen`
rails as they reach production.

---

### Open questions / v1.1 candidates
- Per-institution long tail (thousands of schools, ULBs, small utilities) — templated
  portal-automation + OCR strategy rather than bespoke connectors.
- AA data-quality variance across FIPs; reconciliation rules with statement uploads.
- Bima Sugam / ONDC-finance migration plan to retire scraping-based fallbacks.
- Connector SDK contract (so third parties can add connectors) — its own specification.
