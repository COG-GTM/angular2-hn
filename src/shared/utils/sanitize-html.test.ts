import { describe, expect, it } from 'vitest';

import { sanitizeHtml } from './sanitize-html';

describe('sanitizeHtml', () => {
    it('keeps HN formatting markup', () => {
        const html = '<p>Hi <i>there</i> <a href="https://example.com" rel="nofollow">link</a></p><pre><code>x</code></pre>';
        expect(sanitizeHtml(html).__html).toBe(html);
    });

    it('strips scripts, event handlers and javascript: URLs', () => {
        const { __html } = sanitizeHtml(
            '<p onclick="alert(1)">a</p><script>alert(2)</script><img src=x onerror="alert(3)"><a href="javascript:alert(4)">b</a>'
        );
        expect(__html).not.toMatch(/script|onclick|onerror|javascript:/);
        expect(__html).toContain('<p>a</p>');
    });

    it('handles missing content', () => {
        expect(sanitizeHtml(undefined).__html).toBe('');
    });
});
