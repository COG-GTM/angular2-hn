import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { makeComment } from '../../test/fixtures';
import { renderWithProviders } from '../../test/render';
import { Comment } from './Comment';

describe('Comment', () => {
    it('renders nested comments and collapses the subtree', async () => {
        const comment = makeComment({ comments: [makeComment({ id: 101, user: 'tptacek', content: 'Reply' })] });
        renderWithProviders(<Comment comment={comment} />);

        expect(screen.getByRole('link', { name: 'dang' })).toHaveAttribute('href', '/user/dang');
        expect(screen.getByText('world').tagName).toBe('I');
        expect(screen.getByText('Reply')).toBeVisible();

        await userEvent.click(screen.getAllByText('[-]')[0]);
        expect(screen.getByText('[+]')).toBeInTheDocument();
        expect(screen.getByText('Reply')).not.toBeVisible();
    });

    it('renders deleted comments as a placeholder', () => {
        renderWithProviders(<Comment comment={makeComment({ deleted: true })} />);
        expect(screen.getByText('[deleted]')).toBeInTheDocument();
        expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });
});
