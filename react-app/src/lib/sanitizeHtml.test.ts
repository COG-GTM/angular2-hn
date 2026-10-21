import { describe, expect, it } from 'vitest';

import { sanitizeHtml } from './sanitizeHtml';

describe('sanitizeHtml', () => {
  it('keeps HN markup and links', () => {
    const html = '<p>See <a href="https://example.com" rel="nofollow">this</a> <i>now</i></p><pre><code>x</code></pre>';
    expect(sanitizeHtml(html).__html).toBe(html);
  });

  it('strips scripts, event handlers and javascript: URLs', () => {
    const { __html } = sanitizeHtml(
      '<img src="x" onerror="alert(1)"><script>alert(2)</script><a href="javascript:alert(3)">x</a>'
    );
    expect(__html).not.toMatch(/onerror|<script|javascript:/);
  });

  it('treats missing content as empty', () => {
    expect(sanitizeHtml(undefined)).toEqual({ __html: '' });
    expect(sanitizeHtml(null)).toEqual({ __html: '' });
  });
});
