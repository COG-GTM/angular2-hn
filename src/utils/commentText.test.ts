import { describe, expect, it } from 'vitest';
import { commentText } from './commentText';

describe('commentText', () => {
    it('formats singular and plural comments', () => {
        expect(commentText(1)).toBe('1 comment');
        expect(commentText(2)).toBe('2 comments');
    });
    it('uses discuss when there are no comments', () => expect(commentText(0)).toBe('discuss'));
});
