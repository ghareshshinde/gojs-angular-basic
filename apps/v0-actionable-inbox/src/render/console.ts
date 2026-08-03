// Render the InboxResult to the terminal.

import type { ActionItem, InboxResult } from '../types.ts';

const LANE_LABEL: Record<string, string> = {
  payment_failed: 'PAYMENT FAILED',
  trial_ending: 'TRIAL ENDING',
  deadline: 'DEADLINE',
  bill: 'BILL DUE',
  renewal: 'RENEWAL',
  money_in: 'RECEIVED',
  job: 'JOB',
};

function money(it: ActionItem): string {
  if (it.amount === undefined) return '';
  const sym = it.currency === 'INR' ? '₹' : it.currency === 'USD' ? '$' : '';
  return ` — ${sym}${it.amount.toLocaleString('en-IN')}`;
}

function line(it: ActionItem): string {
  const due = it.dueDate ? `  ⏰ ${it.dueDate}` : '';
  const dup = it.count > 1 ? `  (×${it.count} collapsed)` : '';
  return `  [${String(it.urgency).padStart(3)}] ${LANE_LABEL[it.lane] ?? it.lane}: ${it.title}${money(it)}${due}${dup}`;
}

export function renderConsole(r: InboxResult): string {
  const out: string[] = [];
  out.push('');
  out.push('┌─ ACTIONABLE INBOX ' + '─'.repeat(48));
  out.push(`│ ${r.totalProcessed} emails processed · ${r.actions.length} actions · ` +
    `${r.suppressedCount} suppressed as noise · generated ${r.generatedAt.slice(0, 10)}`);
  out.push('└' + '─'.repeat(66));
  out.push('');
  out.push('▶ NEEDS YOU (ranked):');
  if (r.actions.length === 0) out.push('  (nothing needs action — inbox zero on what matters)');
  for (const it of r.actions) out.push(line(it));

  if (r.moneyIn.length) {
    out.push('');
    out.push('▶ FYI — money received:');
    for (const it of r.moneyIn) out.push(line(it));
  }
  if (r.jobs.length) {
    out.push('');
    out.push(`▶ JOB APPLICATIONS (${r.jobs.length}) — lane enabled:`);
    for (const it of r.jobs.slice(0, 10)) out.push(line(it));
  }
  out.push('');
  return out.join('\n');
}
