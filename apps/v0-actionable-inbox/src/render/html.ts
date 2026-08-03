// Render the InboxResult to a small, self-contained HTML page.

import type { ActionItem, InboxResult } from '../types.ts';

const LANE_META: Record<string, { label: string; color: string }> = {
  payment_failed: { label: 'Payment failed', color: '#c0392b' },
  trial_ending: { label: 'Trial ending', color: '#c26a00' },
  deadline: { label: 'Deadline', color: '#7a5c00' },
  bill: { label: 'Bill due', color: '#8a1c6b' },
  renewal: { label: 'Renewal', color: '#1f6f6a' },
  money_in: { label: 'Received', color: '#2a7d4f' },
  job: { label: 'Job', color: '#34506b' },
};

function esc(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));
}

function money(it: ActionItem): string {
  if (it.amount === undefined) return '';
  const sym = it.currency === 'INR' ? '₹' : it.currency === 'USD' ? '$' : '';
  return `${sym}${it.amount.toLocaleString('en-IN')}`;
}

function card(it: ActionItem): string {
  const m = LANE_META[it.lane] ?? { label: it.lane, color: '#555' };
  const due = it.dueDate ? `<span class="due">⏰ ${it.dueDate}</span>` : '';
  const amt = it.amount !== undefined ? `<span class="amt">${money(it)}</span>` : '';
  const dup = it.count > 1 ? `<span class="dup">${it.count} emails collapsed</span>` : '';
  return `<li class="card">
    <span class="pill" style="--c:${m.color}">${m.label}</span>
    <div class="body"><div class="title">${esc(it.title)}</div>
      <div class="meta">${amt}${due}${dup}<span class="why">${esc(it.reason)}</span></div>
    </div>
    <span class="urg">${it.urgency}</span>
  </li>`;
}

export function renderHtml(r: InboxResult): string {
  const actions = r.actions.map(card).join('\n');
  const moneyIn = r.moneyIn.map(card).join('\n');
  const jobs = r.jobs.map(card).join('\n');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Actionable Inbox — Saarthi v0</title>
<style>
  :root{--bg:#f4f5fb;--surface:#fff;--ink:#12162a;--muted:#5a6079;--line:#dde0ee;--accent:#d98a2b}
  @media(prefers-color-scheme:dark){:root{--bg:#0c0f1e;--surface:#141833;--ink:#eef0fa;--muted:#a6acc8;--line:#2a3057}}
  *{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);
    font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;line-height:1.5}
  .wrap{max-width:760px;margin:0 auto;padding:32px 20px}
  h1{font-size:1.5rem;margin:0 0 4px}.sub{color:var(--muted);font-size:.9rem;margin:0 0 24px}
  h2{font-size:.8rem;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin:28px 0 10px}
  ul{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:10px}
  .card{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:14px 16px;
    display:flex;align-items:center;gap:14px;box-shadow:0 1px 2px rgba(18,22,42,.05)}
  .pill{font-size:.66rem;font-weight:700;letter-spacing:.03em;color:#fff;background:var(--c);
    padding:4px 9px;border-radius:999px;white-space:nowrap}
  .body{flex:1;min-width:0}.title{font-weight:600}
  .meta{display:flex;flex-wrap:wrap;gap:12px;font-size:.8rem;color:var(--muted);margin-top:3px;align-items:center}
  .amt{font-weight:700;color:var(--ink)}.due{color:var(--accent);font-weight:600}
  .dup{background:var(--bg);border:1px solid var(--line);border-radius:999px;padding:1px 8px}
  .why{opacity:.7;font-style:italic}
  .urg{font-variant-numeric:tabular-nums;font-weight:700;color:var(--muted);font-size:.85rem}
  .empty{color:var(--muted);padding:10px 0}
</style></head><body><div class="wrap">
  <h1>Actionable Inbox</h1>
  <p class="sub">${r.totalProcessed} emails processed · ${r.actions.length} actions ·
    ${r.suppressedCount} suppressed as noise · ${esc(r.generatedAt.slice(0, 10))}</p>
  <h2>Needs you</h2>
  <ul>${actions || '<li class="empty">Nothing needs action.</li>'}</ul>
  ${r.moneyIn.length ? `<h2>FYI — money received</h2><ul>${moneyIn}</ul>` : ''}
  ${r.jobs.length ? `<h2>Job applications</h2><ul>${jobs}</ul>` : ''}
</div></body></html>`;
}
