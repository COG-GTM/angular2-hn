import { describe, expect, it } from 'vitest';
import { sanitizeHtml } from './sanitizeHtml';

describe('sanitizeHtml', () => {
  it('keeps HN formatting and safe links', () => {
    const html =
      '<p>Hi <i>there</i></p><a href="https://paulgraham.com" rel="nofollow">site</a><pre><code>x</code></pre>';
    expect(sanitizeHtml(html)).toBe(
      '<p>Hi <i>there</i></p><a href="https://paulgraham.com">site</a><pre><code>x</code></pre>'
    );
  });

  it('strips event handlers and script-like elements', () => {
    expect(sanitizeHtml('<img src=x onerror="alert(1)">ok<script>alert(1)</script>')).toBe('ok');
    expect(sanitizeHtml('<p onclick="alert(1)" style="color:red">a</p>')).toBe('<p>a</p>');
    expect(sanitizeHtml('<svg><g onload="alert(1)"></g></svg><iframe src="x"></iframe>b')).toBe('b');
  });

  it('removes unsafe link protocols', () => {
    expect(sanitizeHtml('<a href="javascript:alert(1)">x</a>')).toBe('<a>x</a>');
    expect(sanitizeHtml('<a href=" JaVaScRiPt:alert(1)">x</a>')).toBe('<a>x</a>');
    expect(sanitizeHtml('<a href="data:text/html,hi">x</a>')).toBe('<a>x</a>');
  });

  it('unwraps unknown tags but keeps their text', () => {
    expect(sanitizeHtml('<div><span>text</span></div>')).toBe('text');
  });
});
