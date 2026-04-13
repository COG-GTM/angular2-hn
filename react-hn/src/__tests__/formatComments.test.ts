import { formatCommentCount } from '../utils/formatComments';

describe('formatCommentCount', () => {
  it('should return "discuss" for 0 comments', () => {
    expect(formatCommentCount(0)).toBe('discuss');
  });

  it('should return "1 comment" for 1 comment', () => {
    expect(formatCommentCount(1)).toBe('1 comment');
  });

  it('should return "5 comments" for 5 comments', () => {
    expect(formatCommentCount(5)).toBe('5 comments');
  });

  it('should return "discuss" for negative numbers', () => {
    expect(formatCommentCount(-1)).toBe('discuss');
  });

  it('should return "100 comments" for 100 comments', () => {
    expect(formatCommentCount(100)).toBe('100 comments');
  });
});
