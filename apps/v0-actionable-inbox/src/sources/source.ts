// An EmailSource abstracts where raw emails come from, so the same pipeline runs
// against fixtures (offline, instant) or the real Gmail API.

import type { RawEmail } from '../types.ts';

export interface EmailSource {
  name: string;
  fetch(windowDays: number): Promise<RawEmail[]>;
}
