// Golden-set evaluation harness (the docs/saarthi/04 §4 discipline, in miniature).
// Runs the classifier over labeled fixtures and reports per-lane precision/recall,
// overall accuracy, and dedup correctness. Exits non-zero if it regresses below target.

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Lane, RawEmail } from '../src/types.ts';
import { classify } from '../src/classify.ts';
import { runPipeline } from '../src/pipeline.ts';
import { defaultConfig } from '../src/config.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

interface Golden {
  labels: Record<string, Lane>;
  expect: { actionItems: number; moneyInItems: number; minAccuracy: number };
}

const emails = JSON.parse(readFileSync(join(root, 'fixtures', 'emails.sample.json'), 'utf8')) as RawEmail[];
const golden = JSON.parse(readFileSync(join(root, 'eval', 'golden.json'), 'utf8')) as Golden;

let correct = 0;
const lanes = new Set<Lane>();
const tp = new Map<Lane, number>();
const fp = new Map<Lane, number>();
const fn = new Map<Lane, number>();
const bump = (m: Map<Lane, number>, k: Lane) => m.set(k, (m.get(k) ?? 0) + 1);
const mismatches: string[] = [];

for (const e of emails) {
  const predicted = classify(e).lane;
  const expected = golden.labels[e.id];
  lanes.add(predicted); lanes.add(expected);
  if (predicted === expected) { correct++; bump(tp, expected); }
  else { bump(fp, predicted); bump(fn, expected); mismatches.push(`  ${e.id}: expected ${expected}, got ${predicted}  — "${e.subject}"`); }
}

const accuracy = correct / emails.length;

// Dedup / pipeline checks.
const result = runPipeline(emails, defaultConfig, new Date('2026-07-31T00:00:00Z'));

console.log('\n=== v0 classifier eval ===');
console.log(`emails: ${emails.length}   correct: ${correct}   accuracy: ${(accuracy * 100).toFixed(1)}%\n`);
console.log('lane                 precision  recall');
for (const lane of [...lanes].sort()) {
  const t = tp.get(lane) ?? 0;
  const prec = t + (fp.get(lane) ?? 0) === 0 ? 1 : t / (t + (fp.get(lane) ?? 0));
  const rec = t + (fn.get(lane) ?? 0) === 0 ? 1 : t / (t + (fn.get(lane) ?? 0));
  console.log(`${lane.padEnd(18)}   ${(prec * 100).toFixed(0).padStart(6)}%  ${(rec * 100).toFixed(0).padStart(5)}%`);
}
if (mismatches.length) { console.log('\nmismatches:'); console.log(mismatches.join('\n')); }

console.log(`\ndedup: ${result.actions.length} action items (expected ${golden.expect.actionItems}), ` +
  `${result.moneyIn.length} money-in (expected ${golden.expect.moneyInItems}), ` +
  `${result.suppressedCount} suppressed`);

const failures: string[] = [];
if (accuracy < golden.expect.minAccuracy) failures.push(`accuracy ${(accuracy * 100).toFixed(1)}% < ${(golden.expect.minAccuracy * 100)}%`);
if (result.actions.length !== golden.expect.actionItems) failures.push(`action items ${result.actions.length} != ${golden.expect.actionItems}`);
if (result.moneyIn.length !== golden.expect.moneyInItems) failures.push(`money-in ${result.moneyIn.length} != ${golden.expect.moneyInItems}`);

if (failures.length) { console.error('\nFAIL:\n  ' + failures.join('\n  ') + '\n'); process.exit(1); }
console.log('\nPASS ✓\n');
