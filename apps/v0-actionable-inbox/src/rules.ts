// Classification rules. LESSON FROM THE REAL INBOX: classify by sender + Gmail
// category FIRST; use subject/snippet only to refine. Keyword-only matching is
// too noisy (a fintech PM's job alerts are full of "insurance/policy/premium/payment").
// Rules are evaluated in order; the first match wins.

import type { Lane, RawEmail } from './types.ts';
import { domainOf } from './extract.ts';

export interface Rule {
  name: string;
  lane: Lane;
  confidence: number;
  match: (e: RawEmail, domain: string, subj: string, body: string) => boolean;
}

// Senders that are job alerts / recruiters — high-volume noise for most users.
const JOB_DOMAINS = [
  'linkedin.com', 'glassdoor.com', 'naukri.com', 'hirist.tech', 'aiapply.co',
  'indeed.com', 'instahyre.com', 'cutshort.io', 'wellfound.com', 'monster.com',
  'ziprecruiter.com', 'foundit.in', 'shine.com',
];

const has = (s: string, ...needles: string[]) => needles.some((n) => s.includes(n));

export const RULES: Rule[] = [
  // 1) Job alerts & recruiters — by sender domain (not by keyword).
  {
    name: 'job-sender',
    lane: 'job',
    confidence: 0.95,
    match: (_e, domain) => JOB_DOMAINS.some((d) => domain === d || domain.endsWith('.' + d)),
  },

  // 2) Coursera *marketing* subdomain — promotional, suppress.
  {
    name: 'coursera-promo',
    lane: 'noise',
    confidence: 0.9,
    match: (_e, domain, subj) =>
      domain === 'm.learn.coursera.org' && !has(subj, 'trial', 'certificate', 'due'),
  },

  // 3) Trial ending / add-payment-or-lose-it (Atlassian/Loom, learning platforms).
  // Ordered BEFORE payment-failed: subscription dunning ("add payment to keep it") is one
  // "trial ending" action, not a hard charge failure — even though the wording overlaps.
  {
    name: 'trial-ending',
    lane: 'trial_ending',
    confidence: 0.85,
    match: (_e, _domain, subj, body) => {
      // "now on X plan" / "moved to Starter" means it's already resolved — not an action.
      if (has(subj, 'now on', 'moved to') && has(subj, 'plan', 'starter')) return false;
      return (
        has(subj, 'trial end', 'trial ends', 'add payment', 'keep your subscription',
          'last chance', 'deactivated', 'downgraded', 'before your') ||
        has(body, 'trial ends', 'add payment details', 'before your subscription is',
          'when your free trial ends')
      );
    },
  },

  // 4) Payment failures — a hard charge failure not tied to a trial-conversion flow.
  {
    name: 'payment-failed',
    lane: 'payment_failed',
    confidence: 0.92,
    match: (_e, _domain, subj, body) =>
      has(subj, 'unsuccessful', 'payment failed', 'failed', "couldn't charge", 'declined') ||
      has(body, "weren't able to charge", "couldn't process payment", 'payment failed', "couldn't charge"),
  },

  // 5) Already-resolved billing state — informational, suppress from actions.
  {
    name: 'plan-changed-info',
    lane: 'noise',
    confidence: 0.8,
    match: (_e, _domain, subj) => has(subj, 'now on', 'moved to') && has(subj, 'plan', 'starter'),
  },

  // 6) Upcoming recurring renewal.
  {
    name: 'renewal',
    lane: 'renewal',
    confidence: 0.85,
    match: (_e, _domain, subj, body) =>
      has(subj, 'will renew', 'renew soon', 'auto-renew', 'renews on', 'subscription renew') ||
      has(body, 'will automatically renew', 'subscription for'),
  },

  // 7) Dated obligations (course quizzes, certificate windows, "last date").
  {
    name: 'deadline',
    lane: 'deadline',
    confidence: 0.8,
    match: (_e, _domain, subj, body) =>
      has(subj, 'due today', 'due:', 'quiz', 'last date', 'assignment', 'deadline', 'expires', 'expiry') ||
      has(body, 'quiz is due', 'due today', 'last date to'),
  },

  // 8) Money received — informational net-worth signal.
  {
    name: 'money-in',
    lane: 'money_in',
    confidence: 0.8,
    match: (_e, _domain, subj, body) =>
      has(subj, 'payment received', 'credited', 'received - thank') ||
      has(body, 'payment received', 'was applied to', 'amount credited'),
  },

  // 9) Category-based fallbacks (Gmail already classifies transactional mail).
  {
    name: 'promotions-category',
    lane: 'noise',
    confidence: 0.6,
    match: (e) => e.gmailCategory === 'promotions' || e.gmailCategory === 'social' || e.gmailCategory === 'forums',
  },
];

/** Runs the ordered rules; returns the first match or a low-confidence noise fallback. */
export function applyRules(e: RawEmail): { lane: Lane; confidence: number; reason: string } {
  const domain = domainOf(e.sender);
  const subj = e.subject.toLowerCase();
  const body = e.snippet.toLowerCase();
  for (const r of RULES) {
    if (r.match(e, domain, subj, body)) {
      return { lane: r.lane, confidence: r.confidence, reason: `matched rule "${r.name}"` };
    }
  }
  return { lane: 'noise', confidence: 0.4, reason: 'no rule matched — defaulted to noise (low confidence)' };
}
