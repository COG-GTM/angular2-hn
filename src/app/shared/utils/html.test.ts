import { hasExternalUrl, linkTargetProps, sanitizedHtml } from './html';

describe('html utils', () => {
  it('detects external urls', () => {
    expect(hasExternalUrl('https://example.com')).toBe(true);
    expect(hasExternalUrl('item?id=1')).toBe(false);
    expect(hasExternalUrl(undefined)).toBe(false);
  });

  it('opens links in a new tab only when enabled', () => {
    expect(linkTargetProps(true)).toEqual({ target: '_blank', rel: 'noopener' });
    expect(linkTargetProps(false)).toEqual({});
  });

  it('strips unsafe markup', () => {
    expect(sanitizedHtml('<p onclick="x()">hi<script>alert(1)</script></p>').__html).toBe('<p>hi</p>');
    expect(sanitizedHtml(undefined).__html).toBe('');
  });
});
