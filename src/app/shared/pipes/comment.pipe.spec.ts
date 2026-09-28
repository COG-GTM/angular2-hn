import { CommentPipe } from './comment.pipe';

describe('CommentPipe', () => {
    const pipe = new CommentPipe();

    it('should render "discuss" when there are no comments', () => {
        expect(pipe.transform(0)).toBe('discuss');
    });

    it('should use the singular form for a single comment', () => {
        expect(pipe.transform(1)).toBe('1 comment');
    });

    it('should use the plural form for multiple comments', () => {
        expect(pipe.transform(42)).toBe('42 comments');
    });
});
