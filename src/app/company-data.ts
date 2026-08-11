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
 * Saarthi: 14 departments · 64 skills · 262 agents                    *
 * Departments are ordered to match the radial layout (Operations on  *
 * top, then clockwise) but order here is not important — positions    *
 * are computed in buildGraph().                                       *
 * ------------------------------------------------------------------ */
export const DEPARTMENTS: Department[] = [
  {
    key: 'LEADERSHIP',
    name: 'Leadership',
    icon: '👑',
    color: '#e2e8f0',
    tagline: 'orchestration · strategy · alignment',
    blurb: 'The layer that makes the company run itself. Orchestrator agents read the Brain, set the priorities, delegate work to the right department, and grade the other agents — a manager of managers.',
    skills: [
      { name: 'Chief of Staff', icon: '🎛️', status: 'dev', autonomy: 'assisted',
        replaces: 'The founder personally being the routing layer for every decision.',
        desc: 'Turns the Brain’s state into today’s priorities and routes work to the right team.',
        agents: ['Priority setter', 'Work router', 'Blocker escalator', 'Standup synthesizer'] },
      { name: 'Orchestration', icon: '🕸️', status: 'dev', autonomy: 'assisted',
        replaces: 'Hand-coordinating five tools and three people to ship one outcome.',
        desc: 'Runs cross-department workflows end-to-end, delegating to department agents.',
        agents: ['Workflow planner', 'Task delegator', 'Result synthesizer', 'Quality arbiter'] },
      { name: 'Strategy & OKRs', icon: '🧭', status: 'planned', autonomy: 'manual',
        replaces: 'A strategy deck that’s out of date the day after the offsite.',
        desc: 'Sets objectives, tracks key results and re-plans when reality moves.',
        agents: ['OKR setter', 'Progress tracker', 'Scenario planner', 'Pivot advisor'] },
      { name: 'Agent Performance', icon: '⭐', status: 'planned', autonomy: 'manual',
        replaces: 'No one checking whether the agents are actually any good.',
        desc: 'Scores every agent’s output and retires or retrains the weak ones.',
        agents: ['Agent scorer', 'Drift detector', 'Retraining trigger', 'Cost auditor'] },
      { name: 'Delivery & Scrum', icon: '🗓️', status: 'dev', autonomy: 'autonomous',
        replaces: 'A team where half the agents are idle and the other half are the bottleneck.',
        desc: 'The Scrum Master: continuously keeps every agent loaded, balanced and unblocked.',
        agents: ['Sprint planner', 'Capacity balancer', 'Idle-agent detector', 'Dependency sequencer', 'Throughput tracker'] }
    ]
  },
  {
    key: 'OPERATIONS',
    name: 'Operations',
    icon: '⚙️',
    color: '#2dd4bf',
    tagline: 'onboarding · builds · client ops',
    blurb: 'Turns a signed insurer, TPA or hospital into a running, integrated account and keeps the machine healthy.',
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
    blurb: 'The always-on research desk — tracks insurers, regulators and the market before the meeting starts.',
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
    blurb: 'Keeps every policyholder, agent and hospital answered, healthy and heard.',
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
    blurb: 'Reads the signals every other department writes to the Brain — bugs, objections, drop-off, feature asks — and turns them into shipped changes to Saarthi: the policy engine, claims flow and member app. This is where Claude Code lives.',
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
  },
  {
    key: 'FINANCE',
    name: 'Finance',
    icon: '🏦',
    color: '#818cf8',
    tagline: 'plan · raise · price · fund',
    blurb: 'The CFO function — forward-looking money. Where Back Office records what happened, Finance decides what happens next: what to spend, what to charge, and when to raise.',
    skills: [
      { name: 'FP&A', icon: '📊', status: 'dev', autonomy: 'assisted',
        replaces: 'A budget in a spreadsheet nobody trusts by week three.',
        desc: 'Builds the plan, watches the variance and forecasts the road ahead.',
        agents: ['Budget builder', 'Variance analyzer', 'Forecast modeler', 'Unit-economics tracker'] },
      { name: 'Fundraising & IR', icon: '💼', status: 'planned', autonomy: 'manual',
        replaces: 'Rebuilding the data room and the board deck from scratch every round.',
        desc: 'Keeps the data room, investor updates and board deck always current.',
        agents: ['Data-room keeper', 'Investor updater', 'Board-deck builder', 'Ask preparer'] },
      { name: 'Pricing & Packaging', icon: '🏷️', status: 'planned', autonomy: 'manual',
        replaces: 'Pricing set once by gut feel and never revisited.',
        desc: 'Models price, guards margin and tests willingness to pay.',
        agents: ['Price modeler', 'Discount guardrail', 'Willingness-to-pay tester', 'Margin analyzer'] },
      { name: 'Treasury & Capital', icon: '🏛️', status: 'planned', autonomy: 'manual',
        replaces: 'Finding out about the cash crunch the week it arrives.',
        desc: 'Allocates cash, guards the runway and approves the spend.',
        agents: ['Cash allocator', 'Runway guardian', 'Spend approver', 'Vendor negotiator'] }
    ]
  },
  {
    key: 'IT',
    name: 'IT & Infrastructure',
    icon: '🗄️',
    color: '#94a3b8',
    tagline: 'compute · capacity · uptime',
    blurb: 'The substrate the whole company runs on. Where Engineering’s DevOps ships the app, IT keeps the agent fleet itself alive — answering the question the founder always forgets: can our compute actually run every agent at once?',
    skills: [
      { name: 'Capacity Planning', icon: '🧮', status: 'dev', autonomy: 'assisted',
        replaces: 'Finding out you can’t run all the agents at once when they all fire at 9am.',
        desc: 'Answers the core question: can our compute run every agent simultaneously?',
        agents: ['Concurrency modeler', 'Token-budget forecaster', 'Bottleneck finder', 'Headroom planner'] },
      { name: 'Provisioning & Scaling', icon: '☁️', status: 'dev', autonomy: 'assisted',
        replaces: 'Servers hand-provisioned and over-bought “just in case.”',
        desc: 'Spins compute up and down to match the fleet’s real demand.',
        agents: ['Auto-scaler', 'GPU allocator', 'Queue manager', 'Cold-start reducer'] },
      { name: 'Reliability & Runtime', icon: '📟', status: 'planned', autonomy: 'manual',
        replaces: 'Agents silently failing because a rate limit tripped or a node died.',
        desc: 'Keeps the agent runtime healthy and fails over before anyone notices.',
        agents: ['Health prober', 'Failover handler', 'Rate-limit guard', 'Runtime pager'] },
      { name: 'Compute FinOps', icon: '💸', status: 'planned', autonomy: 'manual',
        replaces: 'A cloud bill that grows faster than revenue with no one watching.',
        desc: 'Tracks and optimizes what every agent-hour actually costs.',
        agents: ['Spend tracker', 'Model-cost optimizer', 'Idle-resource reaper', 'Usage attributor'] }
    ]
  },
  {
    key: 'LEGAL',
    name: 'Legal & Compliance',
    icon: '⚖️',
    color: '#fb7185',
    tagline: 'regulation · privacy · risk',
    blurb: 'In insurance and health this is the moat, not the paperwork. Keeps Saarthi on the right side of IRDAI, data-privacy law and every policy word — before it becomes a problem, not after.',
    skills: [
      { name: 'Regulatory Compliance', icon: '📜', status: 'dev', autonomy: 'assisted',
        replaces: 'A compliance officer hand-mapping every feature to an IRDAI circular.',
        desc: 'Checks Saarthi against IRDAI rules, filings and circulars as they change.',
        agents: ['Circular watcher', 'Filing preparer', 'Rule mapper', 'Audit-trail keeper'] },
      { name: 'Data Privacy', icon: '🔒', status: 'dev', autonomy: 'assisted',
        replaces: 'Discovering a consent or PII gap during a breach or an audit.',
        desc: 'Guards policyholder and health data under the DPDP Act and consent rules.',
        agents: ['Consent tracker', 'PII mapper', 'Retention enforcer', 'Breach responder'] },
      { name: 'Policy & Contract Wording', icon: '✍️', status: 'planned', autonomy: 'manual',
        replaces: 'Legal reviewing every policy document and endorsement by hand.',
        desc: 'Drafts and reviews policy wordings, endorsements and customer contracts.',
        agents: ['Wording drafter', 'Clause checker', 'Endorsement reviewer', 'Plain-language rewriter'] },
      { name: 'Risk & Fraud', icon: '🕵️', status: 'planned', autonomy: 'manual',
        replaces: 'Catching fraud and model risk only after the payout is made.',
        desc: 'Flags fraud signals and governs underwriting and model risk.',
        agents: ['Fraud flagger', 'Risk scorer', 'Model-governance checker', 'Escalation router'] }
    ]
  },
  {
    key: 'PROSERV',
    name: 'Professional Services',
    icon: '🧰',
    color: '#22d3ee',
    tagline: 'implement · integrate · adopt',
    blurb: 'How Saarthi actually lands inside an insurer, hospital or TPA. Turns a signed contract into a live, integrated deployment — and makes sure it gets used.',
    skills: [
      { name: 'Implementation', icon: '🚀', status: 'dev', autonomy: 'assisted',
        replaces: 'A months-long manual rollout for every new insurer or hospital.',
        desc: 'Stands up Saarthi inside each client’s environment, end to end.',
        agents: ['Rollout planner', 'Config builder', 'Data migrator', 'Go-live checker'] },
      { name: 'Integrations & Interop', icon: '🔌', status: 'dev', autonomy: 'assisted',
        replaces: 'Hand-wiring each insurer core, TPA and hospital system every time.',
        desc: 'Connects Saarthi to insurer cores, TPAs and hospitals over FHIR / HL7 / APIs.',
        agents: ['Core-system connector', 'TPA integrator', 'FHIR / HL7 mapper', 'Sync validator'] },
      { name: 'Solution Engineering', icon: '🧑‍🔧', status: 'planned', autonomy: 'manual',
        replaces: 'Sales promising things the product cannot do yet.',
        desc: 'Scopes what each client needs and designs the fit before the deal closes.',
        agents: ['Needs scoper', 'Solution designer', 'Demo builder', 'Feasibility checker'] },
      { name: 'Adoption & Value', icon: '📈', status: 'planned', autonomy: 'manual',
        replaces: 'A client who bought Saarthi but never fully rolled it out.',
        desc: 'Drives adoption and proves value after go-live so clients expand and renew.',
        agents: ['Adoption tracker', 'Value reporter', 'Expansion spotter', 'QBR builder'] }
    ]
  },
  {
    key: 'EDUCATION',
    name: 'Customer Education',
    icon: '🎓',
    color: '#a3e635',
    tagline: 'docs · training · localization',
    blurb: 'Makes a complex insurance platform learnable — in every language your users actually speak. (SAP runs a 280-person lab for exactly this.)',
    skills: [
      { name: 'Documentation', icon: '📚', status: 'dev', autonomy: 'assisted',
        replaces: 'Docs that are always three releases out of date.',
        desc: 'Keeps product docs, API references and release notes current automatically.',
        agents: ['Doc writer', 'API-ref generator', 'Release-note compiler', 'Screenshot updater'] },
      { name: 'Training & Enablement', icon: '🧑‍🏫', status: 'dev', autonomy: 'assisted',
        replaces: 'Flying a trainer to every insurer branch to explain the same screens.',
        desc: 'Turns features into courses, guides and walkthroughs for agents and staff.',
        agents: ['Course builder', 'Walkthrough author', 'Quiz generator', 'Certification tracker'] },
      { name: 'Localization', icon: '🌐', status: 'planned', autonomy: 'manual',
        replaces: 'Shipping English-only into a ten-language market.',
        desc: 'Translates and adapts Saarthi for Indian languages and regional norms.',
        agents: ['String translator', 'Regional adapter', 'Terminology keeper', 'Locale QA'] },
      { name: 'In-Product Guidance', icon: '💡', status: 'planned', autonomy: 'manual',
        replaces: 'Users stuck on a screen with nowhere to turn but support.',
        desc: 'Builds tooltips, empty states and nudges that teach inside the app.',
        agents: ['Tooltip writer', 'Empty-state designer', 'Nudge planner', 'Help-search tuner'] }
    ]
  }
];

/* ------------------------------------------------------------------ *
 * The Company Brain — the shared knowledge base at the centre.        *
 * ------------------------------------------------------------------ */
export const BRAIN = {
  key: 'BRAIN',
  name: 'Saarthi Brain',
  tag: 'BEFORE EVERYTHING',
  blurb: 'The single place every Saarthi agent reads from and writes to.',
  body: 'Not software you buy — plain files with a strict convention: what Saarthi is, ' +
        'the insurance & health product it ships, the regulations it lives under, and what ' +
        'is true right now. An agent with this context works like a teammate who has been ' +
        'here for years. An agent without it works like a stranger.',
  files: ['saarthi.md', 'product-spec.md', 'irdai-compliance.md', 'insurers/', 'claims-playbooks/', 'voice.md', 'STATE.md'],
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
