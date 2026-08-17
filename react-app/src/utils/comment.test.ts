import { describe, expect, it } from 'vitest';
import { commentCount } from './comment';

describe('commentCount', () => {
    it('returns discuss when there are no comments', () => {
        expect(commentCount(0)).toBe('discuss');
    });

    it('uses the singular form for a single comment', () => {
        expect(commentCount(1)).toBe('1 comment');
    });

    it('uses the plural form for several comments', () => {
        expect(commentCount(12)).toBe('12 comments');
    });
});
