import { CommentPipe } from './comment.pipe';

describe('CommentPipe', () => {
  let pipe: CommentPipe;

  beforeEach(() => {
    pipe = new CommentPipe();
  });

  it('creates an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('returns "discuss" when there are no comments', () => {
    expect(pipe.transform(0)).toBe('discuss');
  });

  it('returns singular form for one comment', () => {
    expect(pipe.transform(1)).toBe('1 comment');
  });

  it('returns plural form for multiple comments', () => {
    expect(pipe.transform(42)).toBe('42 comments');
  });
});
