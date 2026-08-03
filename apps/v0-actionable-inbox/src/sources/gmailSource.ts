// Real Gmail source. Read-only. Requires OAuth credentials (see README §"Real Gmail mode").
//
// This file lazily imports `googleapis` so the fixture demo runs with ZERO dependencies.
// To use it:  npm install googleapis  and set the env vars below, then `npm run real`.
//
// Scopes: gmail.readonly ONLY. v0 never modifies, sends, or labels mail.

import type { EmailSource } from './source.ts';
import type { RawEmail } from '../types.ts';

const GMAIL_CATEGORY_LABELS: Record<string, string> = {
  CATEGORY_PROMOTIONS: 'promotions',
  CATEGORY_UPDATES: 'updates',
  CATEGORY_PERSONAL: 'primary',
  CATEGORY_SOCIAL: 'social',
  CATEGORY_FORUMS: 'forums',
  CATEGORY_PURCHASES: 'purchases',
  CATEGORY_RESERVATIONS: 'reservations',
};

function header(headers: Array<{ name?: string | null; value?: string | null }>, name: string): string {
  const h = headers.find((x) => (x.name ?? '').toLowerCase() === name.toLowerCase());
  return h?.value ?? '';
}

function parseFrom(from: string): { sender: string; fromName?: string } {
  const m = from.match(/^\s*"?([^"<]*)"?\s*<([^>]+)>\s*$/);
  if (m) return { fromName: m[1].trim() || undefined, sender: m[2].trim() };
  return { sender: from.trim() };
}

export class GmailSource implements EmailSource {
  name = 'gmail';

  async fetch(windowDays: number): Promise<RawEmail[]> {
    // Lazy import so this dependency is optional.
    const { google } = await import('googleapis');

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
    if (!clientId || !clientSecret || !refreshToken) {
      throw new Error(
        'Missing Gmail OAuth env vars: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN. See README §"Real Gmail mode".',
      );
    }

    const auth = new google.auth.OAuth2(clientId, clientSecret);
    auth.setCredentials({ refresh_token: refreshToken });
    const gmail = google.gmail({ version: 'v1', auth });

    const q = `newer_than:${windowDays}d -in:sent -in:draft`;
    const out: RawEmail[] = [];
    let pageToken: string | undefined = undefined;

    do {
      const list = await gmail.users.messages.list({ userId: 'me', q, maxResults: 100, pageToken });
      const ids = (list.data.messages ?? []).map((m) => m.id!).filter(Boolean);
      for (const id of ids) {
        const msg = await gmail.users.messages.get({
          userId: 'me', id, format: 'metadata',
          metadataHeaders: ['From', 'Subject', 'Date'],
        });
        const payload = msg.data.payload;
        const headers = payload?.headers ?? [];
        const { sender, fromName } = parseFrom(header(headers, 'From'));
        const labelIds = msg.data.labelIds ?? [];
        const catLabel = labelIds.find((l) => l.startsWith('CATEGORY_'));
        out.push({
          id: msg.data.id!,
          threadId: msg.data.threadId ?? msg.data.id!,
          sender,
          fromName,
          subject: header(headers, 'Subject'),
          snippet: msg.data.snippet ?? '',
          date: new Date(Number(msg.data.internalDate)).toISOString(),
          gmailCategory: catLabel ? GMAIL_CATEGORY_LABELS[catLabel] : undefined,
          labelIds,
        });
      }
      pageToken = list.data.nextPageToken ?? undefined;
    } while (pageToken);

    return out;
  }
}
