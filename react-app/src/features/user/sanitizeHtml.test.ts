import { describe, expect, it } from 'vitest';

import { sanitizeHtml } from './sanitizeHtml';

describe('sanitizeHtml', () => {
  it('keeps HN formatting and safe links', () => {
    const html = '<p>Hi <i>there</i></p><pre><code>x</code></pre><a href="https://a.b/c" rel="nofollow">a</a>';
    expect(sanitizeHtml(html)).toBe(html);
  });

  it('drops scripts, styles and event handlers', () => {
    expect(sanitizeHtml('<img src=x onerror="alert(1)"><script>alert(2)</script><style>p{}</style><p onclick="x()">ok</p>')).toBe(
      '<img src="x"><p>ok</p>'
    );
  });

  it('removes unsafe hrefs', () => {
    expect(sanitizeHtml('<a href="javascript:alert(1)">a</a><a href=" JaVaScRiPt:alert(1)">b</a>')).toBe('<a>a</a><a>b</a>');
    expect(sanitizeHtml('<a href="java&#09;script:alert(1)">c</a>')).toBe('<a>c</a>');
    expect(sanitizeHtml('<a href="/user/pg">d</a>')).toBe('<a href="/user/pg">d</a>');
  });

  it('keeps images with safe src, like Angular', () => {
    expect(sanitizeHtml('<img src="https://e.com/l.png" alt="logo" width="10">')).toBe('<img src="https://e.com/l.png" alt="logo" width="10">');
    expect(sanitizeHtml('<img src="javascript:alert(1)" alt="x">')).toBe('<img alt="x">');
  });

  it('unwraps unknown elements but keeps their text', () => {
    expect(sanitizeHtml('<custom-el style="x"><b>bold</b></custom-el><svg><text>t</text></svg>')).toBe('<b>bold</b>');
  });
});
