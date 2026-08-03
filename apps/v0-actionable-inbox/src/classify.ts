// Classify a raw email into a lane + extracted facts + dedup key.

import type { Classified, Extracted, Lane, RawEmail } from './types.ts';
import { applyRules } from './rules.ts';
import { deriveService, parseAmount, parseDate } from './extract.ts';

// For these lanes a distinct due date means a distinct event, so it's part of the key.
// For recurring lanes (renewal/bill) we group by service+lane so monthly repeats collapse to one.
const DATE_IN_KEY: Record<Lane, boolean> = {
  payment_failed: true,
  trial_ending: true,
  deadline: true,
  bill: false,
  renewal: false,
  money_in: false,
  job: false,
  noise: false,
};

export function classify(e: RawEmail): Classified {
  const { lane, confidence, reason } = applyRules(e);
  const service = deriveService(e);
  const text = `${e.subject} ${e.snippet}`;
  const { amount, currency } = parseAmount(text);
  const dueDate = parseDate(text, e.date);

  const keyDate = DATE_IN_KEY[lane] && dueDate ? dueDate : 'recurring';
  const eventKey = `${service.toLowerCase()}|${lane}|${keyDate}`;

  const extracted: Extracted = { service, amount, currency, dueDate, eventKey };
  return { ...e, lane, confidence, reason, extracted };
}
