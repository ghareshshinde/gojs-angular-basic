# Security & Compliance Program — v1.0

> Saarthi holds a family's entire financial, health, identity, and government life. Trust is the
> product (Principle 3). This document is the cybersecurity and regulatory-compliance program:
> the controls, the threat model, the regulatory mapping, and the operational practices that make
> the data safe and the platform lawful — designed in from P-0, not bolted on (`06 §2`).

---

## 1. Security principles
1. **Zero Trust.** No implicit trust by network location; every request is authenticated,
   authorised (`08`), and encrypted. Service-to-service uses mutual TLS and scoped identities.
2. **Defense in depth.** Controls at edge, app, data, and infra layers — no single control is load-bearing.
3. **Least privilege & minimisation.** Collect and expose the minimum data; short-lived, scoped access.
4. **Secure by default, private by design.** Encryption, masking, and consent are the default state.
5. **Assume breach.** Detection, containment, and recovery are first-class, not afterthoughts.

## 2. Threat model (what we defend against)
| Threat | Primary mitigations |
|--------|---------------------|
| Account takeover / credential theft | Passkeys/MFA, step-up (`08 §3`), risk-scored sessions, hardened recovery |
| Prompt injection via connector/document content | Content-as-data boundary, output validation, grounding (`04 §5`) |
| Data exfiltration / broken access control | ABAC single enforcement point, row-level security, per-tenant keys, audit |
| Tenant isolation breach | `family_id` hard partition (`07 §3`), default-deny network policies |
| Payment fraud / PCI exposure | PCI-scoped provider, tokenisation, isolated billing service (`09 §5`) |
| Insider / support misuse | Just-in-time, consented, fully-audited support access (`08 §2`) |
| Supply-chain / dependency compromise | SBOM, dependency scanning, image signing, pinned builds |
| Connector/third-party compromise | Scoped credentials in vault, per-connector blast-radius limits, anomaly detection |
| DoS / abuse | Gateway rate limits, quotas, WAF, autoscaling with caps |

## 3. Consent & privacy (DPDP-first)
- **Consent Engine** issues, stores, and enforces consent artifacts (DEPA/AA, ABDM, DigiLocker);
  every regulated datum carries a `consent_ref` (`03 §1`, `01 §7`).
- **DPDP data-principal rights**, as first-class flows: notice & purpose limitation, access,
  correction, **erasure** (tombstoning that preserves the bitemporal audit minimum), **portability/
  export**, and **consent revocation** (revocation stops future processing and excludes data from
  retrieval, including from the AI loop, `04 §5`).
- **Purpose binding:** data pulled for one purpose is not reused for another without fresh consent.
- **Children's & dependents' data:** guardian consent; heightened protection for minors' and
  seniors' records.

## 4. Data protection & cryptography
- **Encryption in transit** (TLS 1.2+/mTLS) and **at rest** (AES-256); **field-level encryption**
  and tokenisation for `SENSITIVE_PII`/`FINANCIAL`/`HEALTH`.
- **Key management:** KMS/HSM-backed, **per-tenant data keys**, regular rotation; keys separated
  from data.
- **Secrets:** all connector credentials and tokens in a **vault** — never in the graph, repo, image,
  or env (`06 §2.11`). Short-lived, dynamically issued where possible.
- **Card data:** never stored — provider tokens only, keeping PCI scope minimal (`09 §5`).
- **Residency:** regulated classes stored in-region (India), enforced and audited (`07 §4`).

## 5. Data lifecycle & governance
- **Classification** drives handling (`01 §7`): `PUBLIC…CREDENTIAL`.
- **Retention & deletion:** per-class retention schedules; legal-minimum retention on erasure;
  scheduled purge of expired data; deletion propagates to projections and backups on schedule.
- **Export/portability:** machine-readable family data export (DPDP) — always available, even when
  a membership is `locked` (`09 §6`).

## 6. Application & platform security
- **Secure SDLC:** threat modeling per feature, code review, SAST/DAST, dependency & container
  scanning, secret scanning in CI, image signing, IaC scanning. No secrets in commits.
- **Immutable audit log:** every auth decision, data access, consent change, admin/support action,
  money movement, and connector call is an append-only, tamper-evident audit event.
- **Detection & monitoring:** security telemetry, anomaly detection (impossible travel, unusual
  data access, mandate anomalies), alerting into on-call.
- **Vulnerability management:** patch SLAs by severity, periodic **penetration tests**, a
  **vulnerability disclosure program**, and **red-teaming** at scale (targets by phase, `06 §3`).

## 7. Incident response & resilience
- **IR plan & runbooks:** defined severities, on-call, containment/eradication/recovery steps, and
  **DPDP/RBI/sectoral breach-notification** obligations tracked with their timelines.
- **BCP/DR:** backups, tested restores, RPO/RTO per phase (`06 §3`), multi-AZ at scale.
- **Post-incident reviews:** blameless, with tracked corrective actions.

## 8. Regulatory & compliance mapping
| Domain | Regime | How it's met |
|--------|--------|--------------|
| Personal data | **DPDP Act (India)** | consent engine, rights flows, residency, minimisation (§3,§5) |
| Financial data aggregation | **RBI / DEPA / Account Aggregator** | AA consent artifacts, licensed AA connectors (`03 §2`) |
| Payments & mandates | **RBI / NPCI (UPI AutoPay, e-NACH), PCI-DSS** | mandate rules, tokenisation, isolated billing (`09`) |
| Health data | **ABDM / NHA**, health-data rules | ABHA consent-manager, in-region storage (`03 §2`) |
| Insurance | **IRDAI** | product/claim/free-look rules in workflows (`02`, `03 §5`) |
| Securities/KYC | **SEBI / CKYC / PMLA** | KRA/CKYC connectors, KYC handling (`03`) |
| Org security posture | **SOC 2 / ISO 27001 (track)** | controls program, audits (phase-gated, `06 §5`) |

Compliance is treated as **engineered controls with evidence**, not documentation — each maps to a
mechanism in the specs above.

---

### Open questions / v1.1 candidates
- Which certification first (SOC 2 Type II vs ISO 27001) and target phase.
- Bug-bounty scope and timing.
- Formal Data Protection Impact Assessment (DPIA) per high-risk workflow.
