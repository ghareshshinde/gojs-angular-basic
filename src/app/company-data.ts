/**
 * company-data.ts
 * ---------------------------------------------------------------------------
 * The "brain" of the AI Company Map.
 *
 * A company is modelled as a tree:
 *
 *      Company Brain  (the shared knowledge base every agent reads & writes)
 *        └── Department        e.g. Sales, Deals, Marketing …
 *              └── Skill       a real job you can open and run   e.g. "Lead Sourcing"
 *                    └── Agent a single concrete task            e.g. "Directory scraper"
 *
 * This file is intentionally the single source of truth. The GoJS diagram, the
 * dashboards and the chart view are all derived from the data below, so adding
 * a department / skill / agent automatically flows through the whole product.
 */

export type Status = 'live' | 'dev' | 'planned';
export type Autonomy = 'manual' | 'assisted' | 'autonomous';

export interface Skill {
  name: string;
  icon: string;          // emoji rendered inside the node
  replaces: string;      // "what it replaces" — the human cost it removes
  desc: string;          // one-line description of the job
  status: Status;
  autonomy: Autonomy;
  agents: string[];      // the individual agents that make up this skill
}

export interface Department {
  key: string;
  name: string;
  icon: string;
  color: string;         // accent / glow colour
  tagline: string;
  blurb: string;
  skills: Skill[];
}

/* ------------------------------------------------------------------ *
 * The company: 8 departments · 39 skills · 161 agents                *
 * Departments are ordered to match the radial layout (Operations on  *
 * top, then clockwise) but order here is not important — positions    *
 * are computed in buildGraph().                                       *
 * ------------------------------------------------------------------ */
export const DEPARTMENTS: Department[] = [
  {
    key: 'OPERATIONS',
    name: 'Operations',
    icon: '⚙️',
    color: '#2dd4bf',
    tagline: 'onboarding · builds · client ops',
    blurb: 'Turns a signed client into a running account and keeps the machine healthy.',
    skills: [
      { name: 'Client Onboarding', icon: '🚀', status: 'live', autonomy: 'assisted',
        replaces: 'A week of kickoff calls, spreadsheets and copy-pasted welcome emails.',
        desc: 'Stands up a new client from signature to first value.',
        agents: ['Kickoff builder', 'Access provisioner', 'Welcome sequencer', 'Checklist tracker', 'Data migrator'] },
      { name: 'Integrations', icon: '🔌', status: 'dev', autonomy: 'assisted',
        replaces: 'An engineer wiring up the same CRM / billing / support stack by hand.',
        desc: 'Connects tools and keeps data flowing between them.',
        agents: ['API connector', 'Data mapper', 'Sync monitor', 'Credential vault'] },
      { name: 'QA', icon: '🧪', status: 'dev', autonomy: 'assisted',
        replaces: 'Manual spot-checks that miss the regression until the client finds it.',
        desc: 'Checks every output before it leaves the building.',
        agents: ['Output checker', 'Regression tester', 'Error triager', 'SLA monitor'] },
      { name: 'Status Reporting', icon: '📊', status: 'live', autonomy: 'autonomous',
        replaces: 'The Friday scramble to remember what actually shipped this week.',
        desc: 'Compiles what happened and who is blocked, automatically.',
        agents: ['Update compiler', 'Blocker flagger', 'Digest sender', 'Metric snapshotter'] },
      { name: 'Incident Response', icon: '🚨', status: 'planned', autonomy: 'manual',
        replaces: 'A 2am pager, a panicked Slack thread and no written trail.',
        desc: 'Detects, triages and documents things going wrong.',
        agents: ['Alert triager', 'Runbook executor', 'Postmortem writer', 'Comms notifier'] }
    ]
  },
  {
    key: 'INTELLIGENCE',
    name: 'Intelligence',
    icon: '🔭',
    color: '#f472b6',
    tagline: 'companies · people · markets',
    blurb: 'The always-on research desk — knows the market before the meeting starts.',
    skills: [
      { name: 'Company Research', icon: '🔎', status: 'live', autonomy: 'autonomous',
        replaces: 'An analyst spending an afternoon assembling a one-page brief.',
        desc: 'Builds a live dossier on any company on demand.',
        agents: ['Profile builder', 'News aggregator', 'Filing reader', 'Org-chart mapper'] },
      { name: 'Competitive Intel', icon: '🎯', status: 'dev', autonomy: 'assisted',
        replaces: 'A stale slide deck someone updates once a quarter, if that.',
        desc: 'Tracks what rivals ship, price and say.',
        agents: ['Feature tracker', 'Pricing watcher', 'Positioning analyzer', 'Review miner'] },
      { name: 'Market Mapping', icon: '🗺️', status: 'planned', autonomy: 'manual',
        replaces: 'Guesswork about how big the opportunity really is.',
        desc: 'Sizes segments and maps the landscape.',
        agents: ['Segment sizer', 'Trend spotter', 'Landscape builder', 'TAM / SAM / SOM calc'] },
      { name: 'Signal Monitoring', icon: '📡', status: 'dev', autonomy: 'autonomous',
        replaces: 'Missing the funding round / hire / churn signal until it is too late.',
        desc: 'Watches for buying triggers and routes them.',
        agents: ['Trigger watcher', 'Alert router', 'Digest builder', 'Source crawler'] }
    ]
  },
  {
    key: 'CUSTOMER',
    name: 'Customer',
    icon: '💬',
    color: '#38bdf8',
    tagline: 'support · success · community',
    blurb: 'Keeps every customer answered, healthy and heard.',
    skills: [
      { name: 'Support Deflection', icon: '🛟', status: 'live', autonomy: 'autonomous',
        replaces: 'A queue of tickets that are all the same five questions.',
        desc: 'Answers the repeatable questions before a human sees them.',
        agents: ['FAQ answerer', 'Ticket classifier', 'KB suggester', 'Escalation router'] },
      { name: 'Health Scoring', icon: '❤️‍🩹', status: 'dev', autonomy: 'assisted',
        replaces: 'A gut-feel guess about which accounts are actually doing well.',
        desc: 'Scores every account on real usage and sentiment.',
        agents: ['Usage analyzer', 'Sentiment tracker', 'Score modeler', 'Renewal predictor'] },
      { name: 'Churn Prediction', icon: '📉', status: 'planned', autonomy: 'manual',
        replaces: 'Finding out an account left in the billing report.',
        desc: 'Flags at-risk accounts early enough to save them.',
        agents: ['Risk modeler', 'Early-warning flagger', 'Save-play recommender', 'Cohort analyzer'] },
      { name: 'Community', icon: '🌐', status: 'dev', autonomy: 'assisted',
        replaces: 'A forum nobody has time to moderate or reply in.',
        desc: 'Keeps the community answered and curated.',
        agents: ['Thread moderator', 'Answer drafter', 'Highlight curator', 'Sentiment tracker'] }
    ]
  },
  {
    key: 'BACKOFFICE',
    name: 'Back Office',
    icon: '💰',
    color: '#facc15',
    tagline: 'money · books · office · people',
    blurb: 'The quiet department that makes sure the money is right.',
    skills: [
      { name: 'Invoicing', icon: '🧾', status: 'live', autonomy: 'autonomous',
        replaces: 'Chasing payments by hand and forgetting who owes what.',
        desc: 'Bills, reminds and reconciles without being asked.',
        agents: ['Invoice generator', 'Payment reminder', 'Reconciliation bot', 'Dunning handler', 'Receipt matcher'] },
      { name: 'Financial Reporting', icon: '📈', status: 'dev', autonomy: 'assisted',
        replaces: 'A monthly close that eats three days of the finance team.',
        desc: 'Turns raw ledgers into the numbers leadership needs.',
        agents: ['P&L builder', 'Metric calculator', 'Board-deck gen', 'Expense categorizer'] },
      { name: 'Contracts', icon: '📜', status: 'planned', autonomy: 'manual',
        replaces: 'A legal review bottleneck for every routine agreement.',
        desc: 'Drafts, redlines and tracks agreements.',
        agents: ['Clause drafter', 'Redline reviewer', 'Renewal tracker', 'Signature chaser'] },
      { name: 'Cash-flow Forecasting', icon: '💵', status: 'dev', autonomy: 'assisted',
        replaces: 'A founder guessing how many months of runway are left.',
        desc: 'Projects burn, runway and scenarios.',
        agents: ['Burn modeler', 'Runway projector', 'Scenario builder', 'Vendor tracker'] }
    ]
  },
  {
    key: 'SALES',
    name: 'Sales',
    icon: '🎯',
    color: '#fb923c',
    tagline: 'targeting · outreach · sequencing',
    blurb: 'Finds the right people and starts the right conversations at scale.',
    skills: [
      { name: 'ICP Definition', icon: '🧭', status: 'live', autonomy: 'assisted',
        replaces: 'A vague "anyone with a pulse" target that wastes every other step.',
        desc: 'Defines exactly who you should be selling to.',
        agents: ['Firmographic profiler', 'Persona builder', 'TAM sizer', 'Disqualifier rules', 'Fit scorer'] },
      { name: 'Lead Sourcing', icon: '⛏️', status: 'live', autonomy: 'autonomous',
        replaces: 'An SDR copy-pasting names off LinkedIn for hours.',
        desc: 'Builds targeted lead lists that match the ICP.',
        agents: ['Directory scraper', 'LinkedIn miner', 'Signal list builder', 'List deduper'] },
      { name: 'Enrichment', icon: '💎', status: 'live', autonomy: 'autonomous',
        replaces: 'Paying three data vendors and still getting bounces.',
        desc: 'Fills in emails, phones and firmographics.',
        agents: ['Email finder', 'Phone appender', 'Tech-stack detector', 'Data validator'] },
      { name: 'Cold Email', icon: '✉️', status: 'dev', autonomy: 'assisted',
        replaces: 'A generic blast that lands in spam and gets ignored.',
        desc: 'Writes personalised first-touch emails.',
        agents: ['First-line writer', 'Offer angler', 'Spam scorer', 'A/B variant gen', 'Deliverability checker'] },
      { name: 'Sequencing', icon: '🔁', status: 'dev', autonomy: 'assisted',
        replaces: 'A rep who forgets to follow up on day 3, 7 and 12.',
        desc: 'Runs multi-touch cadences and detects replies.',
        agents: ['Cadence builder', 'Send-time optimizer', 'Follow-up writer', 'Reply detector'] },
      { name: 'Call Prep', icon: '📞', status: 'planned', autonomy: 'manual',
        replaces: 'Walking into a call knowing nothing about the account.',
        desc: 'Briefs the rep before every conversation.',
        agents: ['Account briefer', 'Talking-point gen', 'Objection prepper', 'Competitor cheat-sheet'] }
    ]
  },
  {
    key: 'DEALS',
    name: 'Deals',
    icon: '🤝',
    color: '#f87171',
    tagline: 'replies · calls · closing · pipeline',
    blurb: 'Moves a warm reply all the way to a signed deal.',
    skills: [
      { name: 'Reply Triage', icon: '📥', status: 'live', autonomy: 'autonomous',
        replaces: 'An inbox where hot replies get buried under noise.',
        desc: 'Reads every reply and routes it instantly.',
        agents: ['Intent classifier', 'Sentiment tagger', 'Router', 'Auto-responder'] },
      { name: 'Meeting Booking', icon: '📅', status: 'live', autonomy: 'autonomous',
        replaces: 'The 8-email back-and-forth to find a 30-minute slot.',
        desc: 'Negotiates and books meetings end-to-end.',
        agents: ['Calendar negotiator', 'Invite sender', 'Reschedule handler', 'No-show recoverer'] },
      { name: 'Proposal Writing', icon: '📝', status: 'dev', autonomy: 'assisted',
        replaces: 'Rebuilding the same proposal deck from scratch every time.',
        desc: 'Assembles tailored proposals and pricing.',
        agents: ['Scope drafter', 'Pricing builder', 'Terms generator', 'Proposal QA'] },
      { name: 'Deal Debriefs', icon: '🎙️', status: 'dev', autonomy: 'assisted',
        replaces: 'Notes that never make it into the CRM after a call.',
        desc: 'Summarises calls and updates the record.',
        agents: ['Call summarizer', 'Next-step extractor', 'CRM updater', 'Risk noter'] },
      { name: 'Pipeline Reporting', icon: '📊', status: 'planned', autonomy: 'manual',
        replaces: 'A forecast built on optimism the night before the board call.',
        desc: 'Rolls up the pipeline and flags risk.',
        agents: ['Stage roll-up', 'Forecast modeler', 'Risk flagger', 'Win / loss tagger'] }
    ]
  },
  {
    key: 'MARKETING',
    name: 'Marketing',
    icon: '🎬',
    color: '#a78bfa',
    tagline: 'content · brand · distribution',
    blurb: 'Turns one idea into a week of content across every channel.',
    skills: [
      { name: 'Performance Analysis', icon: '📐', status: 'live', autonomy: 'assisted',
        replaces: 'A dashboard nobody reads and insights nobody acts on.',
        desc: 'Explains what is working and why.',
        agents: ['Channel analyzer', 'Creative scorer', 'Attribution modeler', 'Report writer'] },
      { name: 'Scriptwriting', icon: '✍️', status: 'dev', autonomy: 'assisted',
        replaces: 'Staring at a blank page for every single video.',
        desc: 'Drafts hooks, arcs and CTAs on brief.',
        agents: ['Hook writer', 'Story arc builder', 'CTA optimizer', 'Thumbnail brief'] },
      { name: 'Carousels', icon: '🖼️', status: 'dev', autonomy: 'assisted',
        replaces: 'A designer manually laying out every slide.',
        desc: 'Produces on-brand carousel posts.',
        agents: ['Slide planner', 'Copy writer', 'Layout designer', 'Export packager'] },
      { name: 'Repurposing', icon: '♻️', status: 'live', autonomy: 'autonomous',
        replaces: 'Great long-form content that dies after one post.',
        desc: 'Cuts one asset into many formats.',
        agents: ['Clip finder', 'Caption gen', 'Format adapter', 'Subtitle gen'] },
      { name: 'Distribution', icon: '📤', status: 'dev', autonomy: 'autonomous',
        replaces: 'Manually posting the same thing to six platforms.',
        desc: 'Schedules, posts and cross-promotes everywhere.',
        agents: ['Scheduler', 'Cross-poster', 'Hashtag optimizer', 'Engagement replier', 'Best-time picker'] }
    ]
  },
  {
    key: 'ENGINEERING',
    name: 'Engineering',
    icon: '💻',
    color: '#4ade80',
    tagline: 'product · build · ship',
    blurb: 'Reads the signals every other department writes to the Brain — bugs, objections, drop-off, feature asks — and turns them into shipped changes to the product. This is where Claude Code lives.',
    skills: [
      { name: 'Product Management', icon: '🧩', status: 'dev', autonomy: 'assisted',
        replaces: 'A backlog where customer pain and gut-feel features compete with no rubric.',
        desc: 'Turns signals from every department into a ranked, spec’d backlog.',
        agents: ['Feedback triager', 'Impact scorer', 'Spec writer', 'Roadmap planner'] },
      { name: 'UX & Design', icon: '🎨', status: 'dev', autonomy: 'assisted',
        replaces: 'A designer redrawing the same flows from scratch for every request.',
        desc: 'Turns research and complaints into flows, wireframes and design-system updates.',
        agents: ['Research synthesizer', 'Flow mapper', 'Wireframe drafter', 'Design-system keeper'] },
      { name: 'Frontend', icon: '🖥️', status: 'dev', autonomy: 'assisted',
        replaces: 'A queue of UI tweaks and accessibility fixes waiting on a front-end dev.',
        desc: 'Builds and fixes the interface the customer actually touches.',
        agents: ['Component builder', 'UI bug fixer', 'Accessibility auditor', 'State wirer'] },
      { name: 'Backend & APIs', icon: '🧱', status: 'dev', autonomy: 'assisted',
        replaces: 'Business logic and integrations that only one engineer understands.',
        desc: 'Implements endpoints, rules and integrations behind the product.',
        agents: ['Endpoint builder', 'Business-rule coder', 'Integration wirer', 'Migration writer'] },
      { name: 'Quality & Testing', icon: '🐛', status: 'dev', autonomy: 'assisted',
        replaces: 'Shipping a fix that quietly breaks three other things.',
        desc: 'Writes tests, reproduces bugs and guards every release.',
        agents: ['Test author', 'Bug reproducer', 'Regression guard', 'Release gatekeeper'] },
      { name: 'DevOps & Security', icon: '🛠️', status: 'planned', autonomy: 'manual',
        replaces: 'Manual deploys, mystery outages and finding the PII leak after it is a problem.',
        desc: 'Ships code safely, keeps the lights on and guards the data.',
        agents: ['CI/CD runner', 'Deploy manager', 'Uptime monitor', 'Security scanner'] }
    ]
  }
];

/* ------------------------------------------------------------------ *
 * The Company Brain — the shared knowledge base at the centre.        *
 * ------------------------------------------------------------------ */
export const BRAIN = {
  key: 'BRAIN',
  name: 'Company Brain',
  tag: 'BEFORE EVERYTHING',
  blurb: 'The single place every agent reads from and writes to.',
  body: 'Not software you buy — plain files with a strict convention: who the company is, ' +
        'what it sells, how it speaks, what is true right now. An agent with this context ' +
        'writes like a colleague. An agent without it writes like a stranger.',
  files: ['company.md', 'offer.md', 'voice.md', 'clients/', 'meetings/', 'playbooks/', 'STATE.md'],
  replaces: 'Re-briefing every tool, agency, hire and AI session from scratch, forever.',
  ladder: [
    { level: 'Human-led', text: "Context lives in the founder's head and a thousand chat threads." },
    { level: 'Human-assisted', text: 'Core files exist and humans update them after meaningful work.' },
    { level: 'Fully autonomous', text: 'Every transcript, email and deliverable writes itself back. The brain maintains the brain.' }
  ]
};

/* ------------------------------------------------------------------ *
 * Graph builder — turns the company tree into GoJS node/link arrays,  *
 * laying everything out as a radial constellation.                    *
 * ------------------------------------------------------------------ */
export interface GraphData {
  nodeDataArray: any[];
  linkDataArray: any[];
}

const TAU = Math.PI * 2;

// radii of each ring (in diagram units)
const R_DEPT = 360;
const R_SKILL = 690;
const R_AGENT = 1010;
const R_LABEL = 1240;

function polar(r: number, a: number): string {
  return `${(r * Math.cos(a)).toFixed(1)} ${(r * Math.sin(a)).toFixed(1)}`;
}

export function buildGraph(): GraphData {
  const nodes: any[] = [];
  const links: any[] = [];
  const n = DEPARTMENTS.length;

  // central brain
  nodes.push({ key: BRAIN.key, category: 'brain', text: 'COMPANY\nBRAIN', loc: '0 0', dept: null });

  // decorative "brain particles" so the centre reads as a living cluster
  const sparkColors = DEPARTMENTS.map(d => d.color);
  for (let i = 0; i < 90; i++) {
    // deterministic spiral so the layout is stable across reloads
    const a = i * 2.399963; // golden angle
    const r = 26 + Math.sqrt(i) * 15;
    nodes.push({
      key: 'spark-' + i, category: 'spark',
      loc: polar(r, a),
      color: sparkColors[i % sparkColors.length],
      size: 2 + (i % 3)
    });
  }

  DEPARTMENTS.forEach((dept, di) => {
    const deptAngle = -Math.PI / 2 + (di * TAU) / n; // Operations on top, then clockwise
    const sector = (TAU / n) * 0.82;                 // angular room this department gets
    const J = dept.skills.length;
    const skillSpread = sector / Math.max(J, 1);

    // department hub
    nodes.push({
      key: dept.key, category: 'dept', text: dept.icon,
      loc: polar(R_DEPT, deptAngle), color: dept.color, dept: dept.key
    });
    // department name label out at the perimeter
    nodes.push({
      key: dept.key + '::label', category: 'deptlabel',
      text: dept.name.toUpperCase(), sub: dept.tagline,
      loc: polar(R_LABEL, deptAngle), color: dept.color, dept: dept.key, ref: dept.key
    });
    links.push({ from: BRAIN.key, to: dept.key, color: dept.color, main: true });

    dept.skills.forEach((skill, si) => {
      const skillKey = dept.key + '::' + si;
      const skillAngle = deptAngle + (si - (J - 1) / 2) * skillSpread;
      nodes.push({
        key: skillKey, category: 'skill', text: skill.icon, label: skill.name.toUpperCase(),
        loc: polar(R_SKILL, skillAngle), color: dept.color, status: skill.status,
        dept: dept.key, skillIndex: si
      });
      links.push({ from: dept.key, to: skillKey, color: dept.color });

      const A = skill.agents.length;
      const agentSpread = (skillSpread * 0.72) / Math.max(A, 1);
      skill.agents.forEach((agentName, ai) => {
        const agentKey = skillKey + '::' + ai;
        const agentAngle = skillAngle + (ai - (A - 1) / 2) * agentSpread;
        nodes.push({
          key: agentKey, category: 'agent', text: agentName,
          loc: polar(R_AGENT, agentAngle), color: dept.color,
          status: skill.status, dept: dept.key, skillIndex: si
        });
        links.push({ from: skillKey, to: agentKey, color: dept.color });
      });
    });
  });

  return { nodeDataArray: nodes, linkDataArray: links };
}

/* ------------------------------------------------------------------ *
 * Stats used by the Dashboards and Chart views.                       *
 * ------------------------------------------------------------------ */
export interface DeptStat {
  key: string;
  name: string;
  color: string;
  icon: string;
  skills: number;
  agents: number;
  live: number;
  dev: number;
  planned: number;
}

export interface Stats {
  totalAgents: number;
  totalSkills: number;
  totalDepartments: number;
  status: { live: number; dev: number; planned: number };
  autonomy: { manual: number; assisted: number; autonomous: number };
  departments: DeptStat[];
}

export function computeStats(): Stats {
  const stats: Stats = {
    totalAgents: 0, totalSkills: 0, totalDepartments: DEPARTMENTS.length,
    status: { live: 0, dev: 0, planned: 0 },
    autonomy: { manual: 0, assisted: 0, autonomous: 0 },
    departments: []
  };

  DEPARTMENTS.forEach(dept => {
    const d: DeptStat = {
      key: dept.key, name: dept.name, color: dept.color, icon: dept.icon,
      skills: dept.skills.length, agents: 0, live: 0, dev: 0, planned: 0
    };
    dept.skills.forEach(skill => {
      const count = skill.agents.length;
      d.agents += count;
      stats.totalSkills += 1;
      stats.status[skill.status] += count;
      stats.autonomy[skill.autonomy] += count;
      if (skill.status === 'live') { d.live += count; }
      else if (skill.status === 'dev') { d.dev += count; }
      else { d.planned += count; }
    });
    stats.totalAgents += d.agents;
    stats.departments.push(d);
  });

  return stats;
}

/** Look up a skill by department key + index (used by the detail panel). */
export function findSkill(deptKey: string, index: number): { dept: Department, skill: Skill } | null {
  const dept = DEPARTMENTS.find(d => d.key === deptKey);
  if (!dept || index == null || !dept.skills[index]) { return null; }
  return { dept, skill: dept.skills[index] };
}

export function findDept(deptKey: string): Department | null {
  return DEPARTMENTS.find(d => d.key === deptKey) || null;
}
