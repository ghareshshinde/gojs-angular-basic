// Entry point. Runs the v0 pipeline and prints + writes an Actionable Inbox.
//
//   npm run demo                 # fixtures (offline, no credentials)
//   npm run demo -- --jobs       # also surface the job-applications lane
//   npm run real                 # real Gmail (needs OAuth env vars — see README)

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { EmailSource } from './sources/source.ts';
import { FixtureSource } from './sources/fixtureSource.ts';
import { runPipeline } from './pipeline.ts';
import { defaultConfig } from './config.ts';
import { renderConsole } from './render/console.ts';
import { renderHtml } from './render/html.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

async function main() {
  const args = process.argv.slice(2);
  const useGmail = args.includes('--source=gmail') || args.includes('--real');
  const config = { ...defaultConfig, includeJobLane: args.includes('--jobs') };

  let source: EmailSource;
  if (useGmail) {
    const { GmailSource } = await import('./sources/gmailSource.ts');
    source = new GmailSource();
  } else {
    source = new FixtureSource(join(root, 'fixtures', 'emails.sample.json'));
  }

  const emails = await source.fetch(config.windowDays);
  // Deterministic "now" for the fixtures so the demo is reproducible; real mode uses actual now.
  const now = useGmail ? new Date() : new Date('2026-07-31T00:00:00Z');
  const result = runPipeline(emails, config, now);

  process.stdout.write(renderConsole(result));

  const outDir = join(root, 'out');
  mkdirSync(outDir, { recursive: true });
  const htmlPath = join(outDir, 'actionable-inbox.html');
  writeFileSync(htmlPath, renderHtml(result), 'utf8');
  writeFileSync(join(outDir, 'result.json'), JSON.stringify(result, null, 2), 'utf8');
  process.stdout.write(`\n→ wrote ${htmlPath}\n`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
