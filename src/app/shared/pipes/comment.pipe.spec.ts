import { CommentPipe } from './comment.pipe';

describe('CommentPipe', () => {
  const pipe = new CommentPipe();

  it('returns "discuss" when there are no comments', () => {
    expect(pipe.transform(0)).toBe('discuss');
    expect(pipe.transform(undefined)).toBe('discuss');
  });

  it('uses singular for one comment', () => {
    expect(pipe.transform(1)).toBe('1 comment');
  });

  it('uses plural for many comments', () => {
    expect(pipe.transform(5)).toBe('5 comments');
  });
});
