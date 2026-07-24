// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';

import { sanitizeHtml } from './sanitize';

describe('sanitizeHtml', () => {
    it('keeps benign markup', () => {
        expect(sanitizeHtml('<p>Hello <i>world</i></p>')).toBe('<p>Hello <i>world</i></p>');
    });

    it('strips script tags', () => {
        expect(sanitizeHtml('<p>hi</p><script>alert(1)</script>')).toBe('<p>hi</p>');
    });

    it('strips inline event handlers', () => {
        expect(sanitizeHtml('<img src="x" onerror="alert(1)">')).toBe('<img src="x">');
    });

    it('handles undefined', () => {
        expect(sanitizeHtml(undefined)).toBe('');
    });
});
