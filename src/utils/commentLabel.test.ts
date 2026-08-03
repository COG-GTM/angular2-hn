import { commentLabel } from './commentLabel';

describe('commentLabel', () => {
    it('returns "discuss" when there are no comments', () => {
        expect(commentLabel(0)).toBe('discuss');
        expect(commentLabel(-1)).toBe('discuss');
    });

    it('uses the singular form for a single comment', () => {
        expect(commentLabel(1)).toBe('1 comment');
    });

    it('uses the plural form for several comments', () => {
        expect(commentLabel(2)).toBe('2 comments');
        expect(commentLabel(153)).toBe('153 comments');
    });
});
