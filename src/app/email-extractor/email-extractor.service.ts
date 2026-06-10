import { Injectable } from '@angular/core';

/**
 * Describes a single extracted email and where it came from.
 */
export interface ExtractedEmail {
  /** The normalized (lower-cased, trimmed) email address. */
  email: string;
  /** True when the email was found inside a `mailto:` link/hyperlink. */
  fromMailto: boolean;
}

/**
 * Service that extracts email addresses from arbitrary text or HTML, such as
 * the markup of a LinkedIn homepage.
 *
 * The primary strategy follows the user request of searching for
 * `"mailto:" + "@" + "."` - i.e. `mailto:` hyperlinks that contain a valid
 * looking address. A secondary pass catches any "bare" email addresses that
 * appear in the visible text but are not wrapped in a `mailto:` link.
 */
@Injectable({ providedIn: 'root' })
export class EmailExtractorService {

  /**
   * Matches `mailto:` links and captures the address token (stopping at any
   * query string such as `?subject=...`, quote, angle bracket or whitespace).
   * The token may be percent-encoded (e.g. `%2E` for `.`); the `"@" + "."`
   * rule is enforced after decoding/normalizing in {@link extract}.
   */
  private static readonly MAILTO_REGEX =
    /mailto:([^"'>\s?&]+)/gi;

  /**
   * Matches a "bare" email address: `local@domain.tld`. Requires at least one
   * dot in the domain so the `"@" + "."` rule is honoured.
   */
  private static readonly EMAIL_REGEX =
    /[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}/gi;

  /**
   * Final validation of a candidate address. Mirrors EMAIL_REGEX but anchored
   * so partial matches are rejected.
   */
  private static readonly VALID_EMAIL =
    /^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$/i;

  /**
   * Extract a de-duplicated list of emails from the supplied text/HTML.
   *
   * `mailto:` matches are preferred: if the same address appears both in a
   * `mailto:` link and as bare text, the entry is flagged `fromMailto: true`.
   *
   * @param text Raw text or HTML, e.g. copied from a LinkedIn homepage.
   * @returns The extracted emails in order of first appearance.
   */
  extract(text: string): ExtractedEmail[] {
    if (!text) {
      return [];
    }

    // Map keyed by the normalized email preserves insertion order and lets us
    // upgrade an entry to `fromMailto` if we later see it in a mailto: link.
    const found = new Map<string, ExtractedEmail>();

    const add = (raw: string, fromMailto: boolean) => {
      const email = this.normalize(raw);
      if (!EmailExtractorService.VALID_EMAIL.test(email)) {
        return;
      }
      const existing = found.get(email);
      if (existing) {
        existing.fromMailto = existing.fromMailto || fromMailto;
      } else {
        found.set(email, { email, fromMailto });
      }
    };

    // Pass 1: mailto: links ("mailto:" + "@" + ".").
    let match: RegExpExecArray | null;
    const mailtoRe = new RegExp(EmailExtractorService.MAILTO_REGEX);
    while ((match = mailtoRe.exec(text)) !== null) {
      add(match[1], true);
    }

    // Pass 2: bare addresses anywhere in the text.
    const emailRe = new RegExp(EmailExtractorService.EMAIL_REGEX);
    while ((match = emailRe.exec(text)) !== null) {
      add(match[0], false);
    }

    return Array.from(found.values());
  }

  /**
   * Convenience helper returning only the email strings.
   */
  extractAddresses(text: string): string[] {
    return this.extract(text).map(e => e.email);
  }

  private normalize(raw: string): string {
    const trimmed = raw.trim();
    let decoded = trimmed;
    try {
      // mailto: addresses may be percent-encoded (e.g. %2E for ".").
      decoded = decodeURIComponent(trimmed);
    } catch {
      // Malformed escape sequence - keep the raw value.
    }
    return decoded.toLowerCase();
  }
}
