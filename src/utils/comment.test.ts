import { describe, expect, it } from 'vitest';

import { commentLabel } from './comment';

describe('commentLabel', () => {
    it('uses the singular form for one comment', () => {
        expect(commentLabel(1)).toBe('1 comment');
    });

    it('uses the plural form for several comments', () => {
        expect(commentLabel(12)).toBe('12 comments');
    });

    it('falls back to discuss when there are none', () => {
        expect(commentLabel(0)).toBe('discuss');
        expect(commentLabel(-1)).toBe('discuss');
    });
});
