import { describe, expect, it } from 'vitest';

import { commentLabel } from './comment';

describe('commentLabel', () => {
    it('falls back to discuss when there are no comments', () => {
        expect(commentLabel(0)).toBe('discuss');
    });

    it('singularizes a lone comment', () => {
        expect(commentLabel(1)).toBe('1 comment');
    });

    it('pluralizes multiple comments', () => {
        expect(commentLabel(4)).toBe('4 comments');
    });
});
