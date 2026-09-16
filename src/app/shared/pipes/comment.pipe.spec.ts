import { CommentPipe } from './comment.pipe';

describe('CommentPipe', () => {
  let pipe: CommentPipe;

  beforeEach(() => {
    pipe = new CommentPipe();
  });

  it('should return "discuss" for 0 comments', () => {
    expect(pipe.transform(0)).toBe('discuss');
  });

  it('should return "discuss" for undefined', () => {
    expect(pipe.transform(undefined)).toBe('discuss');
  });

  it('should return "1 comment" for a single comment', () => {
    expect(pipe.transform(1)).toBe('1 comment');
  });

  it('should return "N comments" for multiple comments', () => {
    expect(pipe.transform(5)).toBe('5 comments');
  });
});
