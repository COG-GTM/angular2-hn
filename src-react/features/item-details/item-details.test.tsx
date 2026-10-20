import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { Comment as CommentModel } from '../../shared/models';
import { renderWithProviders } from '../../shared/test-utils';
import { Comment, ItemDetails } from './index';

describe('item-details placeholders', () => {
    it('ItemDetails shows the :id param', () => {
        renderWithProviders(<ItemDetails />, { route: '/item/42', path: '/item/:id' });
        expect(screen.getByTestId('item-id')).toHaveTextContent('42');
    });

    it('Comment renders nested comments recursively', () => {
        const comment = {
            id: 1,
            user: 'a',
            comments: [{ id: 2, user: 'b', comments: [] }],
        } as unknown as CommentModel;
        renderWithProviders(<Comment comment={comment} />);
        expect(screen.getAllByTestId('comment-placeholder')).toHaveLength(2);
    });
});
