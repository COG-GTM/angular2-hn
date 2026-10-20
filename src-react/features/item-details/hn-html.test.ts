import { describe, expect, it } from 'vitest';

import { sanitizeHnHtml } from './hn-html';

describe('sanitizeHnHtml', () => {
    it('resolves HN-relative links against news.ycombinator.com', () => {
        const html = sanitizeHnHtml('See <a href="item?id=123">parent</a> and <a href="/user?id=pg">pg</a>');
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const [item, user] = Array.from(doc.querySelectorAll('a'));
        expect(item.getAttribute('href')).toBe('https://news.ycombinator.com/item?id=123');
        expect(user.getAttribute('href')).toBe('https://news.ycombinator.com/user?id=pg');
        expect(item.getAttribute('rel')).toBe('nofollow noopener noreferrer');
    });

    it('keeps absolute links and still strips unsafe ones', () => {
        const html = sanitizeHnHtml(
            '<a href="https://example.com/a">ok</a><a href="javascript:alert(1)">bad</a><script>x()</script>'
        );
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const [ok, bad] = Array.from(doc.querySelectorAll('a'));
        expect(ok.getAttribute('href')).toBe('https://example.com/a');
        expect(bad.hasAttribute('href')).toBe(false);
        expect(doc.querySelector('script')).toBeNull();
    });

    it('returns an empty string for missing content', () => {
        expect(sanitizeHnHtml(undefined)).toBe('');
    });
});
