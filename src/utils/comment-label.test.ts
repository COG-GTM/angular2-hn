import { commentLabel } from './comment-label';

describe('commentLabel', () => {
  it('returns "discuss" when there are no comments', () => {
    expect(commentLabel(0)).toBe('discuss');
  });

  it('returns singular form for one comment', () => {
    expect(commentLabel(1)).toBe('1 comment');
  });

  it('returns plural form for multiple comments', () => {
    expect(commentLabel(42)).toBe('42 comments');
  });
});
