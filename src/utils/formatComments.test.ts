import { describe, expect, it } from 'vitest';

import { formatComments } from './formatComments';

describe('formatComments', () => {
    it('returns "discuss" when there are no comments', () => {
        expect(formatComments(0)).toBe('discuss');
    });

    it('uses the singular form for a single comment', () => {
        expect(formatComments(1)).toBe('1 comment');
    });

    it('uses the plural form for several comments', () => {
        expect(formatComments(42)).toBe('42 comments');
    });
});
