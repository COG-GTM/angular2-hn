import { describe, expect, it } from 'vitest';

import { sanitizeHtml } from './sanitize-html';

describe('sanitizeHtml', () => {
    it('keeps the markup Hacker News emits', () => {
        const html =
            '<p>Hello <i>there</i> <a href="https://example.com/" rel="nofollow">link</a></p><pre><code>x = 1</code></pre>';
        expect(sanitizeHtml(html)).toBe(html);
    });

    it('removes script-capable elements and event handlers', () => {
        expect(
            sanitizeHtml('<p onclick="alert(1)">hi</p><script>alert(1)</script><img src="x" onerror="alert(1)">')
        ).toBe('<p>hi</p><img src="https://news.ycombinator.com/x">');
        expect(sanitizeHtml('<iframe src="https://evil.example"></iframe><style>p{}</style>text')).toBe('text');
    });

    it('drops javascript: and data: URLs and inline styles', () => {
        expect(sanitizeHtml('<a href="javascript:alert(1)" style="color:red">x</a>')).toBe('<a>x</a>');
        expect(sanitizeHtml('<a href=" JavaScript:alert(1)">x</a>')).toBe('<a>x</a>');
        expect(sanitizeHtml('<a href="java&#10;script:alert(1)">x</a>')).toBe('<a>x</a>');
        expect(sanitizeHtml('<a href="java&#9;scr&#13;ipt:alert(1)">x</a>')).toBe('<a>x</a>');
        expect(sanitizeHtml('<a href="&#x6A;avascript:alert(1)">x</a>')).toBe('<a>x</a>');
        expect(sanitizeHtml('<a href="item?id=1">x</a><a href="mailto:a@b.c">y</a>')).toBe(
            '<a href="https://news.ycombinator.com/item?id=1">x</a><a href="mailto:a@b.c">y</a>'
        );
    });

    it('returns an empty string for missing content', () => {
        expect(sanitizeHtml(undefined)).toBe('');
        expect(sanitizeHtml('')).toBe('');
    });

    it('resolves HN-relative links against news.ycombinator.com and rejects obfuscated schemes', () => {
        expect(sanitizeHtml('<a href="user?id=pg">u</a>')).toBe('<a href="https://news.ycombinator.com/user?id=pg">u</a>');
        expect(sanitizeHtml('<a href="java\nscript:alert(1)">x</a>')).toBe('<a>x</a>');
        expect(sanitizeHtml('<a href=" JAVASCRIPT:alert(1)">x</a>')).toBe('<a>x</a>');
        expect(sanitizeHtml('<a href="javascript&#58;alert(1)">x</a>')).toBe('<a>x</a>');
        expect(sanitizeHtml('<a href="https://example.com/a b">x</a>')).toBe('<a href="https://example.com/a%20b">x</a>');
    });
});
