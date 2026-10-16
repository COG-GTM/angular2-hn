import { formatCommentCount, hasExternalUrl, listStart, sanitizeHtml } from '.';

describe('formatCommentCount (comment pipe)', () => {
    it.each([
        [0, 'discuss'],
        [-1, 'discuss'],
        [1, '1 comment'],
        [2, '2 comments'],
        [130, '130 comments'],
    ])('%i -> %s', (n, expected) => {
        expect(formatCommentCount(n)).toBe(expected);
    });
});

describe('hasExternalUrl', () => {
    it('is true only for http(s) URLs', () => {
        expect(hasExternalUrl('https://example.com')).toBe(true);
        expect(hasExternalUrl('http://example.com')).toBe(true);
        expect(hasExternalUrl('item?id=1')).toBe(false);
        expect(hasExternalUrl(undefined)).toBe(false);
    });
});

describe('listStart', () => {
    it('matches the Angular feed numbering', () => {
        expect(listStart(1)).toBe(1);
        expect(listStart(3)).toBe(61);
    });
});

describe('sanitizeHtml', () => {
    it('keeps HN formatting', () => {
        expect(sanitizeHtml('<p>Hi <i>there</i> <a href="https://x.com">x</a></p>')).toBe(
            '<p>Hi <i>there</i> <a href="https://x.com" rel="nofollow noopener noreferrer">x</a></p>'
        );
    });

    it('strips scripts, handlers and javascript: URLs', () => {
        const out = sanitizeHtml(
            '<img src=x onerror="alert(1)"><script>alert(1)</script><a href="javascript:alert(1)">y</a>'
        );
        expect(out).not.toMatch(/script|onerror|javascript|<img/);
        expect(out).toContain('y');
    });

    it('handles empty input', () => {
        expect(sanitizeHtml(null)).toBe('');
    });
});
