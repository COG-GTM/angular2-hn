import { sanitizeHtml } from './sanitize';

describe('sanitizeHtml', () => {
    it('keeps formatting markup and strips scripts and handlers', () => {
        const { __html } = sanitizeHtml('<p><i>hi</i><img src=x onerror="alert(1)"><script>alert(1)</script></p>');
        expect(__html).toContain('<i>hi</i>');
        expect(__html).not.toContain('onerror');
        expect(__html).not.toContain('<script>');
    });

    it('handles missing content', () => {
        expect(sanitizeHtml(undefined).__html).toBe('');
    });
});
