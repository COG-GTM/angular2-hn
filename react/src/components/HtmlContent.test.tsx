import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { HtmlContent, sanitizeHtml } from './HtmlContent';

describe('sanitizeHtml', () => {
  it('keeps HN formatting markup and safe links', () => {
    const html =
      '<p>Hello <i>there</i></p><pre><code>x = 1</code></pre><a href="https://example.com" rel="nofollow">link</a> <a href="item?id=1">rel</a>';
    expect(sanitizeHtml(html)).toBe(html);
  });

  it('removes scripts, iframes and styles', () => {
    expect(sanitizeHtml('a<script>alert(1)</script><iframe src="https://x"></iframe><style>*{}</style>b')).toBe('ab');
  });

  it('drops event handlers, inline styles and javascript: urls', () => {
    const out = sanitizeHtml('<a href="javascript:alert(1)" onclick="x()" style="color:red">x</a><img src="data:x" onerror="y()">');
    expect(out).toBe('<a>x</a><img>');
  });

  it('decodes entities as HTML text', () => {
    expect(sanitizeHtml('It&#x27;s &quot;ok&quot;')).toBe('It\'s "ok"');
  });
});

describe('HtmlContent', () => {
  it('renders sanitized HTML in the requested element', () => {
    const { container } = render(<HtmlContent as="p" className="x" html={'<b>bold</b><script>bad()</script>'} />);
    const el = container.querySelector('p.x')!;
    expect(el.innerHTML).toBe('<b>bold</b>');
  });

  it('renders nothing for missing html', () => {
    const { container } = render(<HtmlContent html={undefined} />);
    expect(container.firstElementChild!.innerHTML).toBe('');
  });
});
