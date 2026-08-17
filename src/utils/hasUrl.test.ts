import { describe, expect, it } from 'vitest';
import { hasUrl } from './hasUrl';

describe('hasUrl', () => {
    it('detects external links', () => {
        expect(hasUrl('https://example.com')).toBe(true);
    });

    it('rejects internal item links', () => {
        expect(hasUrl('item?id=123')).toBe(false);
        expect(hasUrl(undefined)).toBe(false);
    });
});
