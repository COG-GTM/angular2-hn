import { describe, expect, it } from 'vitest';

import { commentCount } from './comment';

describe('commentCount', () => {
    it.each([
        [0, 'discuss'],
        [1, '1 comment'],
        [2, '2 comments'],
        [30, '30 comments'],
        [-1, 'discuss'],
    ])('formats %i as "%s"', (count, expected) => {
        expect(commentCount(count)).toBe(expected);
    });
});
