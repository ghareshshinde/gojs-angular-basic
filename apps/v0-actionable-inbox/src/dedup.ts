// Collapse repeated messages about the same event into a single ActionItem.
// LESSON FROM THE REAL INBOX: the same trial/renewal reminder arrives 5+ times.

import type { ActionItem, Classified } from './types.ts';

function titleFor(c: Classified): string {
  const s = c.extracted.service;
  switch (c.lane) {
    case 'payment_failed': return `Payment to ${s} failed`;
    case 'trial_ending': return `${s} trial ending — add payment or lose it`;
    case 'deadline': return `${s}: ${c.subject}`;
    case 'renewal': return `${s} subscription renews`;
    case 'bill': return `${s} bill due`;
    case 'money_in': return `Payment received from ${s}`;
    case 'job': return c.subject;
    default: return c.subject;
  }
}

export function dedup(classified: Classified[]): ActionItem[] {
  const groups = new Map<string, Classified[]>();
  for (const c of classified) {
    const arr = groups.get(c.extracted.eventKey);
    if (arr) arr.push(c);
    else groups.set(c.extracted.eventKey, [c]);
  }

  const items: ActionItem[] = [];
  for (const [key, msgs] of groups) {
    msgs.sort((a, b) => a.date.localeCompare(b.date));
    const latest = msgs[msgs.length - 1];
    const earliest = msgs[0];
    // Prefer a due date from the most recent message that has one.
    const dued = [...msgs].reverse().find((m) => m.extracted.dueDate);
    const amt = [...msgs].reverse().find((m) => m.extracted.amount !== undefined);
    items.push({
      id: key,
      lane: latest.lane,
      title: titleFor(latest),
      service: latest.extracted.service,
      amount: amt?.extracted.amount,
      currency: amt?.extracted.currency,
      dueDate: dued?.extracted.dueDate,
      count: msgs.length,
      firstSeen: earliest.date,
      lastSeen: latest.date,
      sourceMessageIds: msgs.map((m) => m.id),
      urgency: 0, // filled by rank()
      reason: latest.reason,
    });
  }
  return items;
}
