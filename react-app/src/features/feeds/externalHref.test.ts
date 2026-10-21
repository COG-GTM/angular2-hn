import { describe, expect, it } from 'vitest';

import { externalHref } from './externalHref';

describe('externalHref', () => {
    it('returns the normalized URL for http(s) links', () => {
        expect(externalHref('https://example.com/a?b=1')).toBe('https://example.com/a?b=1');
        expect(externalHref('http://example.com')).toBe('http://example.com/');
    });

    it.each([
        ['HN-relative Ask/Show URL', 'item?id=123'],
        ['javascript: URL', 'javascript:alert(1)'],
        ['data: URL', 'data:text/html,hi'],
        ['protocol-relative URL', '//evil.example'],
        ['"http" prefix that is not a URL', 'httpfoo'],
        ['empty string', ''],
        ['undefined', undefined],
    ])('returns null for %s', (_, url) => {
        expect(externalHref(url)).toBeNull();
    });
});
