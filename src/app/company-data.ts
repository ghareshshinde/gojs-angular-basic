/**
 * company-data.ts
 * ---------------------------------------------------------------------------
 * The Saarthi Agent Organization — the single source of truth for the map.
 *
 * Saarthi is an India-first, AI-powered Family Responsibility, Financial
 * Intelligence and Life-Management platform. It has TWO agent layers:
 *
 *   Layer A — COMPANY agents   run the startup (they build Saarthi)
 *   Layer B — FAMILY  agents   run for the customer (they manage a family)
 *
 * The map can switch between the two layers. Everything below is authored in a
 * compact form (department -> agent -> what it owns) and expanded into the
 * Skill/Department shape the GoJS diagram, dashboards and chart consume, so the
 * radial layout, counts and detail panels all derive from this one file.
 */

export type Status = 'live' | 'dev' | 'planned';
export type Autonomy = 'manual' | 'assisted' | 'autonomous';

export interface Skill {
  name: string;
  icon: string;
  replaces: string;
  desc: string;
  status: Status;
  autonomy: Autonomy;
  agents: string[];   // the concrete things this agent owns / does
}

export interface Department {
  key: string;
  name: string;
  icon: string;
  color: string;
  tagline: string;
  blurb: string;
  skills: Skill[];
}

/* ------------------------------------------------------------------ *
 * Compact authoring types + expander                                 *
 * ------------------------------------------------------------------ */
interface RawAgent { name: string; icon?: string; owns: string[]; }
interface RawDept {
  key: string; name: string; icon: string; color: string;
  tagline: string; blurb: string; agents: RawAgent[];
}

// deterministic status / autonomy mix so the dashboards read realistically
const STATUS_CYCLE: Status[] = ['live', 'dev', 'dev', 'planned', 'dev', 'live', 'planned'];
const AUTON_CYCLE: Autonomy[] = ['autonomous', 'assisted', 'assisted', 'manual', 'assisted', 'autonomous', 'manual'];
let seed = 0;

function expand(raw: RawDept): Department {
  return {
    key: raw.key, name: raw.name, icon: raw.icon, color: raw.color,
    tagline: raw.tagline, blurb: raw.blurb,
    skills: raw.agents.map((a): Skill => {
      const s = STATUS_CYCLE[seed % STATUS_CYCLE.length];
      const au = AUTON_CYCLE[seed % AUTON_CYCLE.length];
      seed++;
      const owns = a.owns.slice(0, 4);
      return {
        name: a.name,
        icon: a.icon || raw.icon,
        status: s,
        autonomy: au,
        desc: 'Owns ' + a.owns.slice(0, 3).join(', ') + (a.owns.length > 3 ? ' and more.' : '.'),
        replaces: 'A person tracking ' + a.owns[0].toLowerCase() + ' by hand.',
        agents: owns
      };
    })
  };
}

/* ================================================================== *
 *  LAYER A — SAARTHI COMPANY AGENTS  (the org that builds Saarthi)    *
 * ================================================================== */
const COMPANY_RAW: RawDept[] = [
  {
    key: 'CEO', name: 'CEO / Strategy', icon: '👑', color: '#e2e8f0',
    tagline: 'direction · priorities · alignment',
    blurb: 'Ensures Saarthi is building the right company in the right direction. The CEO agent never works alone — it works through the Chief of Staff.',
    agents: [
      { name: 'CEO Agent', icon: '👑', owns: ['company direction', 'strategic priorities', 'key decisions', 'cross-department conflicts', 'resource allocation'] },
      { name: 'Chief of Staff', icon: '🎛️', owns: ['CEO briefing', 'action tracking', 'meeting synthesis', 'cross-agent coordination', 'escalation management'] },
      { name: 'Strategy Agent', icon: '🧭', owns: ['market strategy', 'competitive intelligence', 'strategic planning', 'long-term roadmap'] },
      { name: 'OKR Agent', icon: '🎯', owns: ['company OKRs', 'department OKRs', 'progress', 'blockers', 'KPI tracking'] }
    ]
  },
  {
    key: 'PRODUCT', name: 'Product', icon: '🧩', color: '#a78bfa',
    tagline: 'discovery · roadmap · UX',
    blurb: 'Turns customer problems into products families love.',
    agents: [
      { name: 'CPO / Product Strategy', icon: '🧩', owns: ['product vision', 'roadmap', 'prioritization'] },
      { name: 'Product Discovery', icon: '🔎', owns: ['customer problems', 'interviews', 'research', 'JTBD'] },
      { name: 'PRD Agent', icon: '📝', owns: ['PRDs', 'requirements', 'acceptance criteria'] },
      { name: 'UX Agent', icon: '🎨', owns: ['user journeys', 'UX flows', 'usability'] },
      { name: 'Product Analytics', icon: '📈', owns: ['funnels', 'retention', 'activation', 'feature adoption'] },
      { name: 'Competitive Intelligence', icon: '🕵️', owns: ['competitor monitoring', 'feature comparisons', 'market gaps'] }
    ]
  },
  {
    key: 'ENG', name: 'Engineering', icon: '💻', color: '#4ade80',
    tagline: 'build · scale · reliability',
    blurb: 'Builds reliable Saarthi infrastructure and product capabilities. This is where Claude Code lives.',
    agents: [
      { name: 'CTO Agent', icon: '💻', owns: ['technology strategy', 'engineering direction'] },
      { name: 'Architecture Agent', icon: '🏗️', owns: ['architecture', 'service boundaries', 'scalability', 'technical decisions'] },
      { name: 'Backend Agent', icon: '🧱', owns: ['services', 'APIs', 'business logic'] },
      { name: 'Frontend Agent', icon: '🖥️', owns: ['web UI', 'components', 'state'] },
      { name: 'Mobile Agent', icon: '📱', owns: ['iOS', 'Android', 'app releases'] },
      { name: 'AI Engineering Agent', icon: '🤖', owns: ['agent runtime', 'tool wiring', 'inference plumbing'] },
      { name: 'Data Engineering Agent', icon: '🧮', owns: ['pipelines', 'ETL', 'connectors'] },
      { name: 'Integration Agent', icon: '🔌', owns: ['DigiLocker', 'Account Aggregator', 'BBPS / UPI', 'ABDM / EPFO / NPS'] },
      { name: 'DevOps Agent', icon: '🛠️', owns: ['CI/CD', 'deploys', 'observability'] },
      { name: 'Technical Debt Agent', icon: '🧹', owns: ['refactors', 'dead code', 'upgrade debt'] }
    ]
  },
  {
    key: 'AI', name: 'AI / Intelligence', icon: '🧠', color: '#f472b6',
    tagline: 'reasoning · orchestration · guardrails',
    blurb: 'Makes Saarthi intelligent without sacrificing reliability. AI thinks; policy governs; humans approve where necessary.',
    agents: [
      { name: 'AI Architect', icon: '🧠', owns: ['model strategy', 'agent topology'] },
      { name: 'Agent Orchestrator', icon: '🕸️', owns: ['task routing', 'delegation', 'result synthesis'] },
      { name: 'Planner Agent', icon: '🧭', owns: ['next-best actions', 'plan construction'] },
      { name: 'RAG Agent', icon: '📚', owns: ['retrieval', 'knowledge grounding'] },
      { name: 'Memory Agent', icon: '💾', owns: ['memory lifecycle', 'working / family / decision memory'] },
      { name: 'Evaluation Agent', icon: '✅', owns: ['AI quality tests', 'regression evals'] },
      { name: 'Model Router', icon: '🔀', owns: ['model selection per task', 'cost / quality tradeoff'] },
      { name: 'Prompt / Context Agent', icon: '🎚️', owns: ['context construction', 'prompt optimization'] },
      { name: 'Hallucination Guard', icon: '🛡️', owns: ['factual validation', 'claim checking'] },
      { name: 'AI Cost Agent', icon: '💸', owns: ['inference cost', 'token budgets'] }
    ]
  },
  {
    key: 'DATA', name: 'Data', icon: '🗃️', color: '#38bdf8',
    tagline: 'graph · quality · governance',
    blurb: 'Creates trustworthy, reusable data infrastructure. The data layer owns truth — agents reason over it.',
    agents: [
      { name: 'Data Architect', icon: '🗃️', owns: ['data models', 'schemas', 'stores'] },
      { name: 'Data Quality Agent', icon: '🔍', owns: ['validation', 'dedup', 'anomaly detection'] },
      { name: 'Data Governance Agent', icon: '📋', owns: ['ownership', 'access rules', 'catalog'] },
      { name: 'Transaction Intelligence', icon: '💳', owns: ['transaction parsing', 'categorization', 'enrichment'] },
      { name: 'Graph Agent', icon: '🕸️', owns: ['Family Graph', 'entities', 'relationships'] },
      { name: 'Data Lineage Agent', icon: '🧬', owns: ['source tracing', 'provenance'] },
      { name: 'Data Retention Agent', icon: '🗄️', owns: ['retention policy', 'capture-once / understand-forever'] },
      { name: 'Data Privacy Agent', icon: '🔒', owns: ['PII mapping', 'consent enforcement'] }
    ]
  },
  {
    key: 'FIN', name: 'Finance', icon: '🏦', color: '#818cf8',
    tagline: 'plan · price · fund',
    blurb: 'Ensures Saarthi itself stays financially healthy.',
    agents: [
      { name: 'CFO Agent', icon: '🏦', owns: ['financial strategy', 'board finance'] },
      { name: 'FP&A Agent', icon: '📊', owns: ['budget', 'variance', 'forecast'] },
      { name: 'Revenue Analytics', icon: '📈', owns: ['MRR', 'cohorts', 'expansion'] },
      { name: 'Pricing Agent', icon: '🏷️', owns: ['price model', 'packaging', 'margin'] },
      { name: 'Billing Agent', icon: '🧾', owns: ['invoicing', 'collections', 'reconciliation'] },
      { name: 'Accounts Agent', icon: '📒', owns: ['ledger', 'close', 'reporting'] },
      { name: 'Cashflow Agent', icon: '💵', owns: ['cash position', 'burn'] },
      { name: 'Forecasting Agent', icon: '🔮', owns: ['runway', 'scenarios'] },
      { name: 'Fundraising Agent', icon: '💼', owns: ['data room', 'investor updates', 'board deck'] }
    ]
  },
  {
    key: 'LEGAL', name: 'Legal & Compliance', icon: '⚖️', color: '#fb7185',
    tagline: 'regulation · privacy · risk',
    blurb: 'Prevents Saarthi from creating regulatory or legal risk — critical for a fintech touching money and family data.',
    agents: [
      { name: 'Legal Counsel', icon: '⚖️', owns: ['legal review', 'risk opinions'] },
      { name: 'FinTech Compliance', icon: '📜', owns: ['RBI / SEBI norms', 'AA framework', 'KYC/AML'] },
      { name: 'Tax Compliance', icon: '🧾', owns: ['GST', 'TDS', 'company tax'] },
      { name: 'DPDP Privacy', icon: '🔒', owns: ['DPDP Act', 'consent', 'data rights'] },
      { name: 'Contract Agent', icon: '✍️', owns: ['contracts', 'redlines', 'renewals'] },
      { name: 'IP Agent', icon: '™️', owns: ['trademarks', 'IP filings'] },
      { name: 'Regulatory Intelligence', icon: '📡', owns: ['circular watching', 'rule mapping'] },
      { name: 'Policy Change Monitor', icon: '🔔', owns: ['regulatory change alerts'] },
      { name: 'Audit Agent', icon: '🗂️', owns: ['audit trail', 'evidence keeping'] }
    ]
  },
  {
    key: 'SEC', name: 'Security', icon: '🛡️', color: '#ef4444',
    tagline: 'protect · detect · respond',
    blurb: 'Protects family data and Saarthi infrastructure.',
    agents: [
      { name: 'CISO Agent', icon: '🛡️', owns: ['security strategy', 'risk posture'] },
      { name: 'Identity & Access', icon: '🔑', owns: ['auth', 'RBAC', 'least privilege'] },
      { name: 'Threat Detection', icon: '🚨', owns: ['anomaly detection', 'alerting'] },
      { name: 'Application Security', icon: '🧪', owns: ['SAST/DAST', 'secure coding'] },
      { name: 'Data Security', icon: '🔐', owns: ['encryption', 'tokenization'] },
      { name: 'Secrets Management', icon: '🗝️', owns: ['key vault', 'rotation'] },
      { name: 'Vulnerability Management', icon: '🐛', owns: ['scanning', 'patching'] },
      { name: 'Incident Response', icon: '📟', owns: ['triage', 'containment', 'postmortem'] },
      { name: 'Security Audit', icon: '📋', owns: ['audits', 'compliance evidence'] }
    ]
  },
  {
    key: 'OPS', name: 'Operations', icon: '⚙️', color: '#2dd4bf',
    tagline: 'run · monitor · recover',
    blurb: 'Makes Saarthi operate continuously — connectors, workflows and reliability.',
    agents: [
      { name: 'Operations Manager', icon: '⚙️', owns: ['ops cadence', 'runbooks'] },
      { name: 'Workflow Operations', icon: '🔁', owns: ['workflow health', 'retries'] },
      { name: 'Connector Operations', icon: '🔌', owns: ['connector uptime', 'auth refresh'] },
      { name: 'Incident Management', icon: '🚨', owns: ['incident lifecycle'] },
      { name: 'SLA Monitor', icon: '⏱️', owns: ['SLA tracking', 'breach alerts'] },
      { name: 'Reliability Agent', icon: '🩺', owns: ['health probes', 'failover'] },
      { name: 'Backup Agent', icon: '💽', owns: ['backups', 'restore tests'] },
      { name: 'Disaster Recovery', icon: '🧯', owns: ['DR plan', 'RTO/RPO'] },
      { name: 'Vendor Management', icon: '🤝', owns: ['vendors', 'contracts', 'costs'] }
    ]
  },
  {
    key: 'CS', name: 'Customer Success', icon: '💬', color: '#22d3ee',
    tagline: 'onboard · adopt · retain',
    blurb: 'Ensures families successfully derive value from Saarthi.',
    agents: [
      { name: 'Customer Success', icon: '💬', owns: ['value delivery', 'health scoring'] },
      { name: 'Onboarding Agent', icon: '🚀', owns: ['first-run', 'account setup', 'connectors'] },
      { name: 'Support Agent', icon: '🛟', owns: ['tickets', 'deflection', 'resolution'] },
      { name: 'Family Adoption', icon: '👨‍👩‍👧', owns: ['feature adoption', 'household activation'] },
      { name: 'Retention Agent', icon: '📉', owns: ['churn risk', 'save plays'] },
      { name: 'Feedback Analysis', icon: '🗣️', owns: ['feedback triage', 'themes'] },
      { name: 'Escalation Agent', icon: '❗', owns: ['escalations', 'routing'] }
    ]
  },
  {
    key: 'EDU', name: 'Customer Education', icon: '🎓', color: '#a3e635',
    tagline: 'teach · guide · localize',
    blurb: 'Helps users understand and use Saarthi — financial literacy is part of the product.',
    agents: [
      { name: 'Financial Education', icon: '🎓', owns: ['money basics', 'guides'] },
      { name: 'Tax Education', icon: '🧾', owns: ['tax literacy', 'regime explainers'] },
      { name: 'Insurance Education', icon: '🛡️', owns: ['coverage explainers'] },
      { name: 'Investment Education', icon: '📈', owns: ['investing basics', 'risk literacy'] },
      { name: 'Family Planning Education', icon: '👨‍👩‍👧', owns: ['goals', 'life planning'] },
      { name: 'Help Center', icon: '📚', owns: ['docs', 'FAQs', 'walkthroughs'] },
      { name: 'Content Agent', icon: '✍️', owns: ['articles', 'in-product guidance'] }
    ]
  },
  {
    key: 'GROWTH', name: 'Marketing / Growth', icon: '🎬', color: '#fb923c',
    tagline: 'acquire · convert · retain',
    blurb: 'Acquires the right families efficiently.',
    agents: [
      { name: 'Growth Agent', icon: '🎬', owns: ['growth loops', 'experiments'] },
      { name: 'SEO Agent', icon: '🔍', owns: ['organic', 'content SEO'] },
      { name: 'Content Agent', icon: '✍️', owns: ['blog', 'assets'] },
      { name: 'Social Agent', icon: '📱', owns: ['social channels', 'scheduling'] },
      { name: 'Performance Marketing', icon: '📊', owns: ['paid', 'CAC', 'ROAS'] },
      { name: 'Lifecycle Marketing', icon: '🔁', owns: ['email', 'nudges', 'reactivation'] },
      { name: 'Referral Agent', icon: '🎁', owns: ['referral loops'] },
      { name: 'Brand Agent', icon: '✨', owns: ['brand', 'positioning'] },
      { name: 'Community Agent', icon: '🌐', owns: ['community', 'moderation'] },
      { name: 'Growth Analytics', icon: '📈', owns: ['funnels', 'attribution'] }
    ]
  },
  {
    key: 'SALES', name: 'Sales / Partnerships', icon: '🤝', color: '#facc15',
    tagline: 'distribution · ecosystem',
    blurb: 'Builds distribution and ecosystem relationships — banks, insurers, fintechs, government.',
    agents: [
      { name: 'Partnerships Agent', icon: '🤝', owns: ['partner strategy', 'deals'] },
      { name: 'Bank Partnerships', icon: '🏦', owns: ['bank channels', 'AA integrations'] },
      { name: 'Insurance Partnerships', icon: '🛡️', owns: ['insurer channels'] },
      { name: 'Fintech Partnerships', icon: '💳', owns: ['fintech integrations'] },
      { name: 'Government Ecosystem', icon: '🏛️', owns: ['DigiLocker', 'ABDM', 'scheme APIs'] },
      { name: 'Corporate Partnerships', icon: '🏢', owns: ['B2B2C employers'] },
      { name: 'Investor Relations', icon: '💼', owns: ['incubators', 'investors'] },
      { name: 'B2B Sales', icon: '📞', owns: ['pipeline', 'closing'] }
    ]
  },
  {
    key: 'PROSERV', name: 'Professional Services', icon: '🧰', color: '#fbbf24',
    tagline: 'human expertise, orchestrated',
    blurb: 'Brings human expertise into the system where AI should not operate alone. These agents route, prepare, coordinate and supervise humans — they do not replace them.',
    agents: [
      { name: 'CA Network', icon: '🧮', owns: ['chartered accountants', 'filing review'] },
      { name: 'Tax Expert Network', icon: '🧾', owns: ['tax specialists', 'complex cases'] },
      { name: 'Financial Planner Network', icon: '📊', owns: ['CFPs', 'plan review'] },
      { name: 'Insurance Expert Network', icon: '🛡️', owns: ['advisors', 'claims help'] },
      { name: 'Legal Network', icon: '⚖️', owns: ['lawyers', 'document review'] },
      { name: 'Estate Planning', icon: '📜', owns: ['will drafting', 'succession'] },
      { name: 'Healthcare Network', icon: '🩺', owns: ['doctors', 'second opinions'] },
      { name: 'Travel Network', icon: '✈️', owns: ['travel agents', 'visa help'] }
    ]
  }
];

/* ================================================================== *
 *  LAYER B — SAARTHI FAMILY AGENTS  (the org that serves a family)    *
 *  Grouped into three domains for a clean radial layout.              *
 * ================================================================== */
const FAMILY_RAW: RawDept[] = [
  {
    key: 'FAMFIN', name: 'Family Finance', icon: '🏦', color: '#818cf8',
    tagline: 'money · tax · invest · protect',
    blurb: 'Understands the family’s complete financial position and continuously improves it. The Family CFO leads; specialists reason over the same Family Graph.',
    agents: [
      { name: 'Family CFO', icon: '🏦', owns: ['cashflow', 'budget', 'debt', 'net worth', 'emergency fund', 'financial health'] },
      { name: 'Investment Agent', icon: '📈', owns: ['MF / stocks / bonds', 'NPS / PPF / EPF', 'allocation', 'rebalancing', 'goal mapping'] },
      { name: 'Tax Agent', icon: '🧾', owns: ['Form 16 / AIS / 26AS', 'deductions & exemptions', 'capital gains', 'regime analysis', 'ITR'] },
      { name: 'Insurance Agent', icon: '🛡️', owns: ['life / term / health', 'coverage adequacy', 'renewals', 'claims', 'nominees'] },
      { name: 'Goal Agent', icon: '🎯', owns: ['required corpus', 'inflation', 'funding', 'probability of achievement', 'corrective actions'] },
      { name: 'Opportunity Agent', icon: '💡', owns: ['tax savings', 'better insurance', 'cheaper loans', 'idle cash', 'missed deductions'] },
      { name: 'Risk Agent', icon: '⚠️', owns: ['income risk', 'concentration', 'insurance gaps', 'liquidity', 'fraud & identity'] }
    ]
  },
  {
    key: 'FAMLIFE', name: 'Family Planning & Life', icon: '🧭', color: '#f472b6',
    tagline: 'plan · events · care',
    blurb: 'Decides what the family should do next and handles the big life moments. The Planner is one of Saarthi’s most important agents.',
    agents: [
      { name: 'Planner Agent', icon: '🧭', owns: ['what should this family do next', 'coordinates other agents', 'next-best actions'] },
      { name: 'Life Event Agent', icon: '🎈', owns: ['marriage / birth / death', 'job change', 'relocation', 'major purchase', 'retirement'] },
      { name: 'Estate Agent', icon: '📜', owns: ['Will', 'nominees & executors', 'digital assets', 'succession preparedness'] },
      { name: 'Healthcare Agent', icon: '🩺', owns: ['health records', 'preventive care', 'checkups & vaccinations', 'healthcare planning'] },
      { name: 'Education Agent', icon: '🎓', owns: ['school & higher-ed planning', 'scholarships', 'education corpus', 'education loans'] },
      { name: 'Government Benefits', icon: '🏛️', owns: ['central & state schemes', 'scholarships', 'subsidies', 'pensions'] }
    ]
  },
  {
    key: 'FAMADMIN', name: 'Family Assets & Admin', icon: '🗂️', color: '#22d3ee',
    tagline: 'documents · home · vehicle · travel',
    blurb: 'Keeps the family’s documents, assets and recurring admin under control — capture once, understand forever.',
    agents: [
      { name: 'Document Agent', icon: '📄', owns: ['invoices & statements', 'Form 16 & policies', 'receipts & certificates', 'never discard useful source'] },
      { name: 'Household Agent', icon: '🏠', owns: ['utilities', 'subscriptions', 'maintenance', 'appliances & warranties'] },
      { name: 'Vehicle Agent', icon: '🚗', owns: ['insurance & PUC', 'RC & FASTag', 'service', 'financing & resale'] },
      { name: 'Travel Agent', icon: '✈️', owns: ['passport & visa', 'flights & hotels', 'travel insurance', 'itinerary'] }
    ]
  }
];

export const COMPANY_DEPARTMENTS: Department[] = COMPANY_RAW.map(expand);
export const FAMILY_DEPARTMENTS: Department[] = FAMILY_RAW.map(expand);

export type Layer = 'company' | 'family';
export function layerDepartments(layer: Layer): Department[] {
  return layer === 'company' ? COMPANY_DEPARTMENTS : FAMILY_DEPARTMENTS;
}

/* ------------------------------------------------------------------ *
 * The Saarthi Brain — the data layer that owns truth.                 *
 * ------------------------------------------------------------------ */
export const BRAIN = {
  key: 'BRAIN',
  name: 'Saarthi Brain',
  tag: 'THE DATA LAYER OWNS TRUTH',
  blurb: 'Every agent reasons over this — never around it. Agents don’t own truth; the graph does.',
  body: 'Not a chatbot’s memory — a canonical knowledge and data layer. Sources become ' +
        'canonical data, which becomes the Family Graph, which agents reason over. This is ' +
        'what stops Agent A and Agent B from disagreeing: they read the same truth.',
  files: ['Family Graph', 'Policy Engine', 'Workflow Engine', 'Event Bus', 'Memory', 'Timeline', 'Learning Engine'],
  replaces: 'The family member who became the human integration layer for hundreds of responsibilities.',
  ladder: [
    { level: 'AI reasons', text: 'Agents notice, understand and plan over the graph.' },
    { level: 'Policy governs', text: 'Every action passes the Policy Engine and a risk assessment first.' },
    { level: 'Humans approve', text: 'High-risk actions require explicit approval; then execute, verify, learn.' }
  ]
};

/* ------------------------------------------------------------------ *
 * Graph builder — radial constellation for a given layer.             *
 * ------------------------------------------------------------------ */
export interface GraphData { nodeDataArray: any[]; linkDataArray: any[]; }

const TAU = Math.PI * 2;
const R_DEPT = 360, R_SKILL = 690, R_AGENT = 1010, R_LABEL = 1240;

function polar(r: number, a: number): string {
  return `${(r * Math.cos(a)).toFixed(1)} ${(r * Math.sin(a)).toFixed(1)}`;
}

export function buildGraph(departments: Department[]): GraphData {
  const nodes: any[] = [];
  const links: any[] = [];
  const n = departments.length;

  nodes.push({ key: BRAIN.key, category: 'brain', text: 'SAARTHI\nBRAIN', loc: '0 0', dept: null });

  const sparkColors = departments.map(d => d.color);
  for (let i = 0; i < 90; i++) {
    const a = i * 2.399963;
    const r = 26 + Math.sqrt(i) * 15;
    nodes.push({ key: 'spark-' + i, category: 'spark', loc: polar(r, a), color: sparkColors[i % sparkColors.length], size: 2 + (i % 3) });
  }

  departments.forEach((dept, di) => {
    const deptAngle = -Math.PI / 2 + (di * TAU) / n;
    const sector = (TAU / n) * 0.82;
    const J = dept.skills.length;
    const skillSpread = sector / Math.max(J, 1);

    nodes.push({ key: dept.key, category: 'dept', text: dept.icon, loc: polar(R_DEPT, deptAngle), color: dept.color, dept: dept.key });
    nodes.push({ key: dept.key + '::label', category: 'deptlabel', text: dept.name.toUpperCase(), sub: dept.tagline, loc: polar(R_LABEL, deptAngle), color: dept.color, dept: dept.key, ref: dept.key });
    links.push({ from: BRAIN.key, to: dept.key, color: dept.color, main: true });

    dept.skills.forEach((skill, si) => {
      const skillKey = dept.key + '::' + si;
      const skillAngle = deptAngle + (si - (J - 1) / 2) * skillSpread;
      nodes.push({ key: skillKey, category: 'skill', text: skill.icon, label: skill.name.toUpperCase(), loc: polar(R_SKILL, skillAngle), color: dept.color, status: skill.status, dept: dept.key, skillIndex: si });
      links.push({ from: dept.key, to: skillKey, color: dept.color });

      const A = skill.agents.length;
      const agentSpread = (skillSpread * 0.72) / Math.max(A, 1);
      skill.agents.forEach((agentName, ai) => {
        const agentKey = skillKey + '::' + ai;
        const agentAngle = skillAngle + (ai - (A - 1) / 2) * agentSpread;
        nodes.push({ key: agentKey, category: 'agent', text: agentName, loc: polar(R_AGENT, agentAngle), color: dept.color, status: skill.status, dept: dept.key, skillIndex: si });
        links.push({ from: skillKey, to: agentKey, color: dept.color });
      });
    });
  });

  return { nodeDataArray: nodes, linkDataArray: links };
}

/* ------------------------------------------------------------------ *
 * Stats for the dashboards / chart.                                   *
 * ------------------------------------------------------------------ */
export interface DeptStat { key: string; name: string; color: string; icon: string; skills: number; agents: number; live: number; dev: number; planned: number; }
export interface Stats {
  totalAgents: number; totalSkills: number; totalDepartments: number;
  status: { live: number; dev: number; planned: number };
  autonomy: { manual: number; assisted: number; autonomous: number };
  departments: DeptStat[];
}

export function computeStats(departments: Department[]): Stats {
  const stats: Stats = {
    totalAgents: 0, totalSkills: 0, totalDepartments: departments.length,
    status: { live: 0, dev: 0, planned: 0 },
    autonomy: { manual: 0, assisted: 0, autonomous: 0 },
    departments: []
  };
  departments.forEach(dept => {
    const d: DeptStat = { key: dept.key, name: dept.name, color: dept.color, icon: dept.icon, skills: dept.skills.length, agents: 0, live: 0, dev: 0, planned: 0 };
    dept.skills.forEach(skill => {
      const count = skill.agents.length;
      d.agents += count;
      stats.totalSkills += 1;
      stats.status[skill.status] += count;
      stats.autonomy[skill.autonomy] += count;
      if (skill.status === 'live') { d.live += count; } else if (skill.status === 'dev') { d.dev += count; } else { d.planned += count; }
    });
    stats.totalAgents += d.agents;
    stats.departments.push(d);
  });
  return stats;
}

export function findSkill(departments: Department[], deptKey: string, index: number): { dept: Department, skill: Skill } | null {
  const dept = departments.find(d => d.key === deptKey);
  if (!dept || index == null || !dept.skills[index]) { return null; }
  return { dept, skill: dept.skills[index] };
}
export function findDept(departments: Department[], deptKey: string): Department | null {
  return departments.find(d => d.key === deptKey) || null;
}
