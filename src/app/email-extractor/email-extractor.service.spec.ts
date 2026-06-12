import { EmailExtractorService } from './email-extractor.service';

describe('EmailExtractorService', () => {
  let service: EmailExtractorService;

  beforeEach(() => {
    service = new EmailExtractorService();
  });

  it('returns an empty list for empty/undefined input', () => {
    expect(service.extract('')).toEqual([]);
    expect(service.extract(undefined as any)).toEqual([]);
  });

  it('extracts an email from a mailto: link and flags it', () => {
    const html = '<a href="mailto:jane.doe@example.com">Email Jane</a>';
    const result = service.extract(html);
    expect(result).toEqual([{ email: 'jane.doe@example.com', fromMailto: true }]);
  });

  it('extracts bare email addresses from text', () => {
    const text = 'Reach me at john@sample.org for details.';
    expect(service.extractAddresses(text)).toEqual(['john@sample.org']);
  });

  it('strips mailto: query parameters', () => {
    const html = '<a href="mailto:hr@company.co?subject=Hello&cc=x@y.com">HR</a>';
    const result = service.extractAddresses(html);
    expect(result).toContain('hr@company.co');
  });

  it('de-duplicates case-insensitively and prefers the mailto flag', () => {
    const text =
      'Contact Sam@Work.com or <a href="mailto:sam@work.com">here</a>.';
    const result = service.extract(text);
    expect(result.length).toBe(1);
    expect(result[0].email).toBe('sam@work.com');
    expect(result[0].fromMailto).toBe(true);
  });

  it('decodes percent-encoded mailto addresses', () => {
    const html = '<a href="mailto:first%2Elast@corp%2Ecom">x</a>';
    expect(service.extractAddresses(html)).toContain('first.last@corp.com');
  });

  it('ignores @ tokens without a dotted domain', () => {
    const text = 'My handle is @linkedin and not an email.';
    expect(service.extract(text)).toEqual([]);
  });

  it('pulls multiple emails from realistic LinkedIn-style markup', () => {
    const html = `
      <ul>
        <li><a href="mailto:recruiter@bigco.com">Recruiter</a></li>
        <li>Direct: alex.smith@startup.io</li>
        <li><a href="mailto:careers@bigco.com?subject=Job">Careers</a></li>
      </ul>`;
    const addresses = service.extractAddresses(html);
    expect(addresses).toEqual([
      'recruiter@bigco.com',
      'careers@bigco.com',
      'alex.smith@startup.io'
    ]);
  });
});
