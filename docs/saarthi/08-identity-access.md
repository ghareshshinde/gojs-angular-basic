# Identity & Access — v1.0

> Who can log in, as whom, and what they may see and do. The identity plane is **separate from the
> `Person`** entity (`01 §3.8`): people are tracked in the Twin whether or not they log in; a
> `UserAccount` is an authentication principal bound to a Person. Access is **persona-wise** and
> enforced by ABAC over the Family Digital Twin.

---

## 1. Principles
1. **Identity ≠ Person.** A dependent child or parent is a `Person` with no login; an adult member
   is a `Person` with a `UserAccount`. This keeps the family model intact regardless of who logs in.
2. **Least privilege, family-scoped.** Every grant is scoped to a `family_id` and the minimum
   entities/actions needed. Default deny.
3. **Persona shapes the experience and the permissions.** The same app renders and authorises
   differently per persona.
4. **Sensitive actions demand step-up.** Viewing masked data is one bar; moving money or changing an
   address is another.

## 2. Personas (login module)
The persona is set at onboarding (WF-FAM-001) and drives navigation, defaults, and authorisation.

| Persona | Who | Sees | Can do |
|---------|-----|------|--------|
| **Family Admin** | primary account holder | whole family Twin | manage members, billing, high-value approvals, delegation |
| **Adult Member** | spouse/earning adult | own + shared family scope | manage own assets, approve own actions, contribute |
| **Caregiver** | adult caring for a dependent | the cared-for person's scope (health, renewals) | act on behalf within delegated scope |
| **Dependent (view)** | older child / senior who logs in | own limited profile | view, request, low-risk self-service |
| **Delegate / Advisor** | CA, financial advisor, trusted contact | explicitly shared scope, time-bounded | act within delegation only |
| **Support Agent** | Saarthi support | consented, audited, minimal | assist; never sees raw secrets; every access logged |
| **System** | agents/services | scoped service identity | automated steps within Policy Engine limits |

Personas map to `Role`s; a `UserAccount` may hold more than one (an Adult Member who is also the
Family Admin). Children/seniors without logins are represented and acted-for via `Delegation`.

## 3. Authentication
- **Primary factor:** mobile number + OTP and/or **passkeys (FIDO2/WebAuthn)**; email as secondary.
  Optional social/SSO later. Aadhaar eKYC is used for *identity verification*, **not** as a login
  factor (privacy).
- **MFA / step-up (AAL):** low-risk browsing at AAL1; **step-up to AAL2** (biometric/passkey/OTP)
  before any money movement, government filing, address change, consent grant, or data export.
- **Sessions:** short-lived access tokens + rotating refresh; device binding; risk-scored
  (new device/geo velocity → re-challenge); explicit sign-out and remote revoke.
- **Account recovery:** multi-signal, throttled, and tied to trusted contacts (WF-FAM-011) to
  resist takeover — recovery is the classic attack vector, so it gets the same rigor as login.

## 4. Authorisation (ABAC over the Twin)
- **Model:** attribute-based. A grant is `subject (role/persona) × action × resource-predicate ×
  condition`. Predicates are evaluated over FDT attributes (e.g. "adult member may `approve` a
  `Payment` where `amount ≤ family.auto_limit` and `owner == self`").
- **Enforcement point:** authorisation is checked at the **API gateway / policy layer** and again
  in the Policy Engine for mutating workflow steps — never scattered ad-hoc in feature code
  (mirrors the single-enforcement-point rule for entitlements, `06 §2.6`, `09 §4`).
- **Delegation & break-glass:** `Delegation` grants time-bounded scope (caregiver, advisor, POA).
  **Emergency break-glass** (WF-LIFE-010) opens pre-agreed access to trusted contacts on a verified
  crisis — heavily audited, notified to the family, auto-expiring.
- **Consent vs authorisation:** distinct. Authorisation says *a user may act*; consent (`03`, `10 §3`)
  says *Saarthi may use regulated data*. Both must hold.

## 5. Auditability
Every authentication, authorisation decision, delegation, step-up, and support access is an
immutable audit event (`10 §6`). "Who saw/did what, when, under which grant or consent" is always
answerable — required for DPDP and for family trust.

---

### Open questions / v1.1 candidates
- Joint-approval (two-adult) flows for very high-value actions.
- Minor-to-adult transition: automatic re-scoping of a dependent's access at 18.
- Advisor marketplace identity & vetting (ties to Bible Vol 9).
