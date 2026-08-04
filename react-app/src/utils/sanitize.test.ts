import { describe, expect, it } from 'vitest';

import { sanitizeHtml } from './sanitize';

describe('sanitizeHtml', () => {
    it('keeps the formatting the API returns', () => {
        expect(sanitizeHtml('<p>hello <a href="https://example.com">link</a></p>')).toBe(
            '<p>hello <a href="https://example.com">link</a></p>'
        );
    });

    it('strips scripts and inline event handlers', () => {
        expect(sanitizeHtml('<p>hi</p><script>alert(1)</script>')).toBe('<p>hi</p>');
        expect(sanitizeHtml('<img src="x" onerror="alert(1)">')).toBe('<img src="x">');
    });
});
