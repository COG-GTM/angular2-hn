import { CommentPipe } from './comment.pipe';
import { PipesModule } from './pipes.module';

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
    expect(pipe.transform(-5)).toBe('discuss');
  });

  it('returns singular "comment" for exactly one comment', () => {
    expect(pipe.transform(1)).toBe('1 comment');
  });

  it('returns plural "comments" for more than one comment', () => {
    expect(pipe.transform(2)).toBe('2 comments');
    expect(pipe.transform(42)).toBe('42 comments');
  });

  it('exposes the PipesModule', () => {
    expect(new PipesModule()).toBeTruthy();
  });
});
