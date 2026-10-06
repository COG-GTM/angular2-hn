import { formatCommentCount } from './comment';

describe('formatCommentCount', () => {
    it.each([
        [0, 'discuss'],
        [-3, 'discuss'],
        [1, '1 comment'],
        [2, '2 comments'],
        [128, '128 comments'],
    ])('formats %i as "%s"', (count, expected) => {
        expect(formatCommentCount(count)).toBe(expected);
    });
});
