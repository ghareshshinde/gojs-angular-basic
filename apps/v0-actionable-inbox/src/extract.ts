// Extraction helpers: pull amount, due date, and service name from an email.
// Deliberately conservative — these are heuristics, and every downstream item
// carries a confidence + reason so low-quality extractions are visible, not hidden.

import type { RawEmail } from './types.ts';

const MONTHS: Record<string, number> = {
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6, july: 7,
  august: 8, september: 9, october: 10, november: 11, december: 12,
  jan: 1, feb: 2, mar: 3, apr: 4, jun: 6, jul: 7, aug: 8, sep: 9, sept: 9, oct: 10, nov: 11, dec: 12,
};

function iso(y: number, m: number, d: number): string {
  const mm = String(m).padStart(2, '0');
  const dd = String(d).padStart(2, '0');
  return `${y}-${mm}-${dd}`;
}

/** Parse a due/renewal date from free text. Handles "July 9, 2026", "Jul 7 2026", and "due today". */
export function parseDate(text: string, emailDate: string): string | undefined {
  const t = text.toLowerCase();
  if (/\bdue today\b|\btoday\b/.test(t) && /\bdue\b/.test(t)) {
    return emailDate.slice(0, 10);
  }
  // "July 9, 2026" or "July 09, 2026"
  const withComma = t.match(/([a-z]+)\s+(\d{1,2}),\s*(\d{4})/);
  if (withComma && MONTHS[withComma[1]]) {
    return iso(Number(withComma[3]), MONTHS[withComma[1]], Number(withComma[2]));
  }
  // "Jul 7 2026" (no comma)
  const noComma = t.match(/\b([a-z]{3,9})\s+(\d{1,2})\s+(\d{4})\b/);
  if (noComma && MONTHS[noComma[1]]) {
    return iso(Number(noComma[3]), MONTHS[noComma[1]], Number(noComma[2]));
  }
  return undefined;
}

/** Parse a monetary amount + currency from text. Handles ₹, $, and "2359 INR". */
export function parseAmount(text: string): { amount?: number; currency?: string } {
  const rupee = text.match(/₹\s?([\d,]+(?:\.\d+)?)/);
  if (rupee) return { amount: Number(rupee[1].replace(/,/g, '')), currency: 'INR' };
  const inr = text.match(/\b([\d,]+(?:\.\d+)?)\s?INR\b/i);
  if (inr) return { amount: Number(inr[1].replace(/,/g, '')), currency: 'INR' };
  const dollar = text.match(/\$\s?([\d,]+(?:\.\d+)?)/);
  if (dollar) return { amount: Number(dollar[1].replace(/,/g, '')), currency: 'USD' };
  return {};
}

/** Canonical service name for known multi-product billing senders, so repeats dedup cleanly. */
const DOMAIN_SERVICE: Record<string, string> = {
  'po.atlassian.net': 'Atlassian/Loom',
  't.learn.coursera.org': 'Coursera',
  'm.learn.coursera.org': 'Coursera',
  'erulearning.com': 'Emeritus',
  'propelld.com': 'Propelld',
  'upwork.com': 'Upwork',
};

export function domainOf(sender: string): string {
  const at = sender.lastIndexOf('@');
  return at >= 0 ? sender.slice(at + 1).toLowerCase() : sender.toLowerCase();
}

/** Best-effort service/merchant name. Prefers a canonical domain map, then subject cues, then display name. */
export function deriveService(e: RawEmail): string {
  const domain = domainOf(e.sender);
  if (DOMAIN_SERVICE[domain]) return DOMAIN_SERVICE[domain];

  // Stripe multiplexes many merchants — pull the service out of the subject.
  if (domain.endsWith('stripe.com')) {
    const to = e.subject.match(/payment to ([A-Za-z0-9][\w .-]+?)\s+(?:was|is|were|failed)/i);
    if (to) return to[1].trim();
    const sub = e.subject.match(/your ([A-Za-z0-9][\w .-]+?) subscription/i);
    if (sub) return sub[1].trim();
  }
  if (e.fromName && e.fromName.trim()) return e.fromName.trim();
  // Fall back to the registrable-ish domain label.
  const label = domain.split('.').slice(-2, -1)[0] ?? domain;
  return label.charAt(0).toUpperCase() + label.slice(1);
}
