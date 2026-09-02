import { describe, expect, it } from 'vitest';

import { sanitizeHtml } from './sanitizeHtml';

describe('sanitizeHtml', () => {
    it('keeps the markup Hacker News content uses', () => {
        expect(sanitizeHtml('<p>hi <a href="https://example.com">link</a></p>')).toBe(
            '<p>hi <a href="https://example.com">link</a></p>'
        );
    });

    it('strips scripts and inline event handlers', () => {
        expect(sanitizeHtml('<img src=x onerror="alert(1)"><script>alert(1)</script>')).toBe('<img src="x">');
    });
});
