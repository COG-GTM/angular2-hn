import { describe, expect, it } from 'vitest';
import { sanitizeHtml } from './sanitizeHtml';

describe('sanitizeHtml', () => {
  it('keeps the markup HN emits', () => {
    const html =
      '<p>Hi <i>there</i></p><p><a href="https://example.com/x" rel="nofollow">link</a></p><pre><code>x &lt; 1</code></pre>';
    expect(sanitizeHtml(html)).toBe(html);
  });

  it('drops scripts and other active elements', () => {
    expect(sanitizeHtml('<p>a</p><script>alert(1)</script><iframe src="x"></iframe><style>p{}</style>')).toBe(
      '<p>a</p>'
    );
  });

  it('removes event handlers and non-link attributes', () => {
    expect(sanitizeHtml('<p onclick="x()" style="color:red">a</p><a href="/item?id=1" onmouseover="x()">b</a>')).toBe(
      '<p>a</p><a href="/item?id=1">b</a>'
    );
  });

  it('strips unsafe link URLs', () => {
    expect(sanitizeHtml('<a href="javascript:alert(1)">x</a>')).toBe('<a>x</a>');
    expect(sanitizeHtml('<a href=" JAVASCRIPT:alert(1)">x</a>')).toBe('<a>x</a>');
    expect(sanitizeHtml('<a href="data:text/html,x">x</a>')).toBe('<a>x</a>');
    expect(sanitizeHtml('<a href="mailto:a@b.c">x</a>')).toBe('<a href="mailto:a@b.c">x</a>');
  });

  it('unwraps unknown elements but keeps their text', () => {
    expect(sanitizeHtml('<div><img src="x" onerror="alert(1)"><font>text</font></div>')).toBe('text');
  });

  it('handles empty input', () => {
    expect(sanitizeHtml(undefined)).toBe('');
    expect(sanitizeHtml('')).toBe('');
  });
});
