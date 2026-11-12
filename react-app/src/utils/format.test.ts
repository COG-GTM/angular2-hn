import { feedListStart, formatCommentCount, hasExternalUrl, sanitizeHtml } from './format';

describe('formatCommentCount (Angular comment pipe)', () => {
    it.each([
        [0, 'discuss'],
        [-1, 'discuss'],
        [1, '1 comment'],
        [2, '2 comments'],
        [150, '150 comments'],
    ])('%i -> %s', (count, expected) => {
        expect(formatCommentCount(count)).toBe(expected);
    });
});

describe('hasExternalUrl', () => {
    it('is true only for http(s) urls', () => {
        expect(hasExternalUrl('https://example.com')).toBe(true);
        expect(hasExternalUrl('http://example.com')).toBe(true);
        expect(hasExternalUrl('item?id=1')).toBe(false);
        expect(hasExternalUrl(undefined)).toBe(false);
    });
});

describe('feedListStart', () => {
    it('numbers lists across pages of 30', () => {
        expect(feedListStart(1, 30)).toBe(1);
        expect(feedListStart(3, 30)).toBe(61);
    });
});

describe('sanitizeHtml', () => {
    it('keeps formatting but strips scripts and handlers', () => {
        const html = sanitizeHtml('<i>hi</i><img src=x onerror="alert(1)"><script>alert(1)</script>');
        expect(html).toContain('<i>hi</i>');
        expect(html).not.toContain('onerror');
        expect(html).not.toContain('<script');
    });
});
