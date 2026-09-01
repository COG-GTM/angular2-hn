import { formatCommentCount } from './comment-count';

describe('formatCommentCount', () => {
    it.each([
        [0, 'discuss'],
        [1, '1 comment'],
        [2, '2 comments'],
        [30, '30 comments'],
        [-1, 'discuss'],
    ])('formats %s as %s', (count, expected) => {
        expect(formatCommentCount(count)).toBe(expected);
    });
});
