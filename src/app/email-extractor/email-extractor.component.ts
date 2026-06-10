import { Component } from '@angular/core';
import { EmailExtractorService, ExtractedEmail } from './email-extractor.service';

@Component({
  selector: 'app-email-extractor',
  templateUrl: './email-extractor.component.html',
  styleUrls: ['./email-extractor.component.css']
})
export class EmailExtractorComponent {

  /** Raw text/HTML pasted by the user (e.g. their LinkedIn homepage source). */
  sourceText = '';

  /** Extracted, de-duplicated emails. */
  emails: ExtractedEmail[] = [];

  /** True once an extraction has run, so we can show a "no results" message. */
  hasExtracted = false;

  /** Transient status message for copy/download feedback. */
  status = '';

  constructor(private extractor: EmailExtractorService) {}

  extract(): void {
    this.emails = this.extractor.extract(this.sourceText);
    this.hasExtracted = true;
    this.status = '';
  }

  clear(): void {
    this.sourceText = '';
    this.emails = [];
    this.hasExtracted = false;
    this.status = '';
  }

  get addresses(): string[] {
    return this.emails.map(e => e.email);
  }

  copyAll(): void {
    const text = this.addresses.join('\n');
    if (!text) {
      return;
    }
    const done = () => this.flash(`Copied ${this.emails.length} email(s) to clipboard.`);
    const nav: any = typeof navigator !== 'undefined' ? navigator : undefined;
    if (nav && nav.clipboard && nav.clipboard.writeText) {
      nav.clipboard.writeText(text).then(done, () => this.fallbackCopy(text, done));
    } else {
      this.fallbackCopy(text, done);
    }
  }

  downloadCsv(): void {
    if (!this.emails.length) {
      return;
    }
    const rows = ['email,from_mailto']
      .concat(this.emails.map(e => `${e.email},${e.fromMailto}`));
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'linkedin-emails.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    this.flash(`Downloaded ${this.emails.length} email(s).`);
  }

  private fallbackCopy(text: string, done: () => void): void {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      done();
    } finally {
      document.body.removeChild(ta);
    }
  }

  private flash(message: string): void {
    this.status = message;
  }
}
