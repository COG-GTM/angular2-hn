import { CommentPipe } from './comment.pipe';

describe('CommentPipe', () => {
  let pipe: CommentPipe;

  beforeEach(() => {
    pipe = new CommentPipe();
  });

  it('returns "discuss" for 0 comments', () => {
    expect(pipe.transform(0)).toBe('discuss');
  });

  it('returns "discuss" for negative counts', () => {
    expect(pipe.transform(-5)).toBe('discuss');
  });

  it('returns singular "1 comment" for one comment', () => {
    expect(pipe.transform(1)).toBe('1 comment');
  });

  it('returns plural "N comments" for many comments', () => {
    expect(pipe.transform(2)).toBe('2 comments');
    expect(pipe.transform(42)).toBe('42 comments');
  });
});
