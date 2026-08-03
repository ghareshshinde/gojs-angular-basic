// The v0 pipeline: raw emails -> classify -> dedup -> rank -> InboxResult.

import type { ActionItem, Classified, InboxResult, RawEmail } from './types.ts';
import type { Config } from './config.ts';
import { ACTIONABLE_LANES } from './types.ts';
import { classify } from './classify.ts';
import { dedup } from './dedup.ts';
import { rank } from './rank.ts';

export function runPipeline(emails: RawEmail[], config: Config, now: Date): InboxResult {
  const classified: Classified[] = emails.map(classify);

  const actionable = classified.filter((c) => ACTIONABLE_LANES.includes(c.lane));
  const moneyInMsgs = classified.filter((c) => c.lane === 'money_in');
  const jobMsgs = classified.filter((c) => c.lane === 'job');
  const suppressed = classified.filter(
    (c) => c.lane === 'noise' || (c.lane === 'job' && !config.includeJobLane),
  );

  const actions = rank(dedup(actionable), now);
  const moneyIn = dedup(moneyInMsgs);
  const jobs: ActionItem[] = config.includeJobLane ? rank(dedup(jobMsgs), now) : [];

  return {
    actions,
    moneyIn,
    jobs,
    suppressedCount: suppressed.length,
    totalProcessed: emails.length,
    generatedAt: now.toISOString(),
  };
}
