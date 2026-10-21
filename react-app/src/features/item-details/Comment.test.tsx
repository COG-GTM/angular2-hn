import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { Comment as CommentModel } from '../../shared/models';
import { renderWithProviders } from '../../shared/test-utils';
import { Comment } from './Comment';

// Placeholder test — owned by the Item-details child; replace with real Comment tests.
describe('Comment (placeholder)', () => {
    it('takes a comment', () => {
        renderWithProviders(<Comment comment={{ id: 1, user: 'pg', comments: [] } as unknown as CommentModel} />);
        expect(screen.getByTestId('comment')).toHaveTextContent('pg');
    });
});
