import { CommentPipe } from './comment.pipe';

describe('CommentPipe', () => {
  it('formats comment counts and zero as discuss', () => {
    const pipe = new CommentPipe();

    expect(pipe.transform(0)).toBe('discuss');
    expect(pipe.transform(1)).toBe('1 comment');
    expect(pipe.transform(5)).toBe('5 comments');
    expect(pipe.transform(-1)).toBe('discuss');
  });
});
