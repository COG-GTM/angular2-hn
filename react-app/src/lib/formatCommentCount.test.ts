import { formatCommentCount } from './formatCommentCount';

describe('formatCommentCount', () => {
  it.each([
    [0, 'discuss'],
    [-1, 'discuss'],
    [1, '1 comment'],
    [2, '2 comments'],
    [150, '150 comments'],
  ])('%i -> %s', (count, expected) => {
    expect(formatCommentCount(count)).toBe(expected);
  });
});
