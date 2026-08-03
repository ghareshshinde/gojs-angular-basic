// Core types for the v0 "Actionable Inbox".
// See docs/saarthi/11-v0-gmail-actionable-inbox.md — this is a thin vertical slice
// of the Family Digital Twin (01) + email_ingest connector (03 §6A) + suggest-tier AI (04).

/** The closed set of lanes an email is classified into. */
export type Lane =
  | 'payment_failed' // a charge failed / needs action
  | 'trial_ending'   // free trial converting or lapsing
  | 'deadline'       // a dated obligation (quiz, certificate, "last date")
  | 'renewal'        // a recurring paid subscription auto-renewing
  | 'bill'           // utility/card/loan due (generalises; rare in v0 inboxes)
  | 'money_in'       // payment received / credited — informational, net-worth signal
  | 'job'            // job alerts / recruiters — optional lane, suppressed by default
  | 'noise';         // newsletters, promotions, everything else — suppressed

/** Lanes that produce action items the user should act on, most-urgent kind first. */
export const ACTIONABLE_LANES: Lane[] = ['payment_failed', 'trial_ending', 'deadline', 'bill', 'renewal'];

/** A raw email as returned by an EmailSource (Gmail API or fixtures). */
export interface RawEmail {
  id: string;
  threadId: string;
  sender: string;            // email address of the sender
  fromName?: string;         // display name, if any
  subject: string;
  snippet: string;
  date: string;              // ISO 8601
  gmailCategory?: string;    // primary | promotions | updates | purchases | reservations | social | forums
  labelIds?: string[];
}

/** Structured facts pulled out of a classified email. */
export interface Extracted {
  service: string;           // the merchant / service the item concerns
  amount?: number;
  currency?: string;         // 'INR' | 'USD' | ...
  dueDate?: string;          // ISO date (YYYY-MM-DD)
  eventKey: string;          // dedup key — collapses repeats of the same event
}

/** An email after classification. */
export interface Classified extends RawEmail {
  lane: Lane;
  confidence: number;        // 0..1
  extracted: Extracted;
  reason: string;            // human-readable "why this lane" (for transparency)
}

/** A deduped, ranked action surfaced to the user. */
export interface ActionItem {
  id: string;                // = eventKey
  lane: Lane;
  title: string;
  service: string;
  amount?: number;
  currency?: string;
  dueDate?: string;
  count: number;             // how many source messages collapsed into this
  firstSeen: string;         // ISO
  lastSeen: string;          // ISO
  sourceMessageIds: string[];
  urgency: number;           // higher = more urgent
  reason: string;
}

/** The output of the pipeline. */
export interface InboxResult {
  actions: ActionItem[];         // ranked, actionable
  moneyIn: ActionItem[];         // informational
  jobs: ActionItem[];            // only populated when config.includeJobLane
  suppressedCount: number;       // noise hidden
  totalProcessed: number;
  generatedAt: string;
}
