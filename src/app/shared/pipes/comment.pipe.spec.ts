import { CommentPipe } from './comment.pipe';

describe('CommentPipe', () => {
  const pipe = new CommentPipe();

  it('renders "discuss" when there are no comments', () => {
    expect(pipe.transform(0)).toBe('discuss');
  });

  it('uses the singular for one comment', () => {
    expect(pipe.transform(1)).toBe('1 comment');
  });

  it('uses the plural for more than one comment', () => {
    expect(pipe.transform(42)).toBe('42 comments');
  });
});
