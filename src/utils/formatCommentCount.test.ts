import { expect, it } from 'vitest';
import { formatCommentCount } from './formatCommentCount';
it.each([[-1, 'discuss'], [0, 'discuss'], [1, '1 comment'], [2, '2 comments']])('formats %s', (count, expected) => {
  expect(formatCommentCount(count)).toBe(expected);
});
