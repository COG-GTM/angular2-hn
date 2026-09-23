import { describe, expect, it } from 'vitest';

import { commentCount } from './commentCount';

describe('commentCount', () => {
    it('matches the Angular comment pipe output', () => {
        expect(commentCount(0)).toBe('discuss');
        expect(commentCount(1)).toBe('1 comment');
        expect(commentCount(2)).toBe('2 comments');
    });
});
