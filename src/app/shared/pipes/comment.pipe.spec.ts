import { CommentPipe } from './comment.pipe';

describe('CommentPipe', () => {
  const pipe = new CommentPipe();

  it('returns "discuss" when there are no comments', () => {
    expect(pipe.transform(0)).toBe('discuss');
  });

  it('returns "discuss" for negative, undefined or null counts', () => {
    expect(pipe.transform(-1)).toBe('discuss');
    expect(pipe.transform(undefined)).toBe('discuss');
    expect(pipe.transform(null)).toBe('discuss');
  });

  it('uses the singular for exactly one comment', () => {
    expect(pipe.transform(1)).toBe('1 comment');
  });

  it('uses the plural for more than one comment', () => {
    expect(pipe.transform(2)).toBe('2 comments');
    expect(pipe.transform(345)).toBe('345 comments');
  });
});
