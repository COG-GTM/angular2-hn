import { CommentPipe } from './comment.pipe';

describe('CommentPipe', () => {
  let pipe: CommentPipe;

  beforeEach(() => {
    pipe = new CommentPipe();
  });

  it('returns "discuss" when there are no comments', () => {
    expect(pipe.transform(0)).toBe('discuss');
  });

  it('uses singular form for one comment', () => {
    expect(pipe.transform(1)).toBe('1 comment');
  });

  it('uses plural form for multiple comments', () => {
    expect(pipe.transform(5)).toBe('5 comments');
  });
});
