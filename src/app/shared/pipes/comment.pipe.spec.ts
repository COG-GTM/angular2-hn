import { CommentPipe } from './comment.pipe';

describe('CommentPipe', () => {
    const pipe = new CommentPipe();

    it('formats comment counts', () => {
        expect(pipe.transform(0)).toBe('discuss');
        expect(pipe.transform(1)).toBe('1 comment');
        expect(pipe.transform(5)).toBe('5 comments');
    });
});
