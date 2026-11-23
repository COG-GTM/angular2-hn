import { sanitizeHtml } from './sanitizeHtml';

describe('sanitizeHtml', () => {
  it('keeps HN formatting markup', () => {
    const html = '<i>hi</i><p><a href="https://example.com" rel="nofollow">link</a></p><pre><code>x</code></pre>';
    expect(sanitizeHtml(html)).toBe(html);
  });

  it('removes scripts, event handlers and javascript: URLs', () => {
    const out = sanitizeHtml('<img src="x" onerror="alert(1)"><script>alert(2)</script><a href="javascript:alert(3)">x</a>');
    expect(out).not.toMatch(/onerror|<script|javascript:/);
  });
});
