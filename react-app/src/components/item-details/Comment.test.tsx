import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { makeComment, renderWithProviders } from '../../test/utils';
import { Comment } from './Comment';

describe('Comment', () => {
    it('renders html content and nested replies', () => {
        const comment = makeComment({
            comments: [makeComment({ id: 11, user: 'carol', content: '<p>A reply</p>' })],
        });

        renderWithProviders(<Comment comment={comment} />);

        expect(screen.getByText('Nice post')).toBeInTheDocument();
        expect(screen.getByText('A reply')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'carol' })).toHaveAttribute('href', '/user/carol');
    });

    it('collapses and expands the subtree', async () => {
        renderWithProviders(<Comment comment={makeComment()} />);

        await userEvent.click(screen.getByText('[-]'));
        expect(screen.getByText('Nice post')).not.toBeVisible();

        await userEvent.click(screen.getByText('[+]'));
        expect(screen.getByText('Nice post')).toBeVisible();
    });

    it('renders a placeholder for deleted comments', () => {
        renderWithProviders(<Comment comment={makeComment({ deleted: true })} />);

        expect(screen.getByText('Comment Deleted', { exact: false })).toBeInTheDocument();
        expect(screen.queryByText('Nice post')).not.toBeInTheDocument();
    });
});
