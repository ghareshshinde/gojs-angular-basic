// Rank action items by urgency = lane criticality + due-date proximity + amount.

import type { ActionItem, Lane } from './types.ts';

const LANE_WEIGHT: Record<Lane, number> = {
  payment_failed: 100,
  trial_ending: 80,
  deadline: 70,
  bill: 60,
  renewal: 40,
  money_in: 10,
  job: 5,
  noise: 0,
};

const DAY = 24 * 60 * 60 * 1000;

export function rank(items: ActionItem[], now: Date): ActionItem[] {
  for (const it of items) {
    let score = LANE_WEIGHT[it.lane];
    if (it.dueDate) {
      const days = Math.round((new Date(it.dueDate + 'T00:00:00Z').getTime() - now.getTime()) / DAY);
      if (days < 0) score += 50; // overdue — bubble up
      else score += Math.max(0, 45 - days); // sooner = higher
    }
    if (it.amount) score += Math.min(20, it.amount / 500);
    it.urgency = Math.round(score);
  }
  return items.sort((a, b) => b.urgency - a.urgency);
}
