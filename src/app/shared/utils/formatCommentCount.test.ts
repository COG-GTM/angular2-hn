import { formatCommentCount } from './formatCommentCount';

describe('formatCommentCount', () => {
  it('prompts discussion when there are no comments', () => {
    expect(formatCommentCount(0)).toBe('discuss');
  });

  it('uses singular and plural forms', () => {
    expect(formatCommentCount(1)).toBe('1 comment');
    expect(formatCommentCount(12)).toBe('12 comments');
  });
});
