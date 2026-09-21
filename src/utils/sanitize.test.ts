import { describe, expect, it } from 'vitest';

import { sanitizeHtml } from './sanitize';

describe('sanitizeHtml', () => {
    it('returns an empty string for missing content', () => {
        expect(sanitizeHtml(undefined)).toBe('');
        expect(sanitizeHtml('')).toBe('');
    });

    it('strips scripts while keeping markup', () => {
        expect(sanitizeHtml('<p>safe</p><script>alert(1)</script>')).toBe('<p>safe</p>');
    });
});
