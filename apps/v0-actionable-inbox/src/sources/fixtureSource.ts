// Reads raw emails from a JSON fixture file — lets the whole pipeline run offline,
// with no credentials, using data that mirrors real-inbox patterns.

import { readFileSync } from 'node:fs';
import type { EmailSource } from './source.ts';
import type { RawEmail } from '../types.ts';

export class FixtureSource implements EmailSource {
  name = 'fixtures';
  private path: string;
  constructor(path: string) {
    this.path = path;
  }
  async fetch(_windowDays: number): Promise<RawEmail[]> {
    const raw = JSON.parse(readFileSync(this.path, 'utf8')) as RawEmail[];
    return raw;
  }
}
