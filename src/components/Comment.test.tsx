import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { Comment } from './Comment';
import type { Comment as CommentModel } from '../models';
import { mockMatchMedia, renderWithProviders } from '../test/utils';

function makeComment(overrides: Partial<CommentModel> = {}): CommentModel {
    return {
        id: 1,
        level: 0,
        user: 'alice',
        time: 0,
        time_ago: '1 hour ago',
        content: '<p>top level</p>',
        deleted: false,
        comments: [],
        ...overrides,
    };
}

beforeEach(() => {
    localStorage.clear();
    mockMatchMedia(false);
});

describe('Comment', () => {
    it('renders the author, time and sanitized content', () => {
        const { container } = renderWithProviders(
            <Comment comment={makeComment({ content: '<p>hello<script>alert(1)</script></p>' })} />
        );

        expect(screen.getByRole('link', { name: 'alice' })).toHaveAttribute('href', '/user/alice');
        expect(screen.getByText('1 hour ago')).toBeInTheDocument();
        expect(screen.getByText(/hello/)).toBeInTheDocument();
        expect(container.querySelector('script')).toBeNull();
    });

    it('renders nested comments recursively', () => {
        const comment = makeComment({
            comments: [
                makeComment({
                    id: 2,
                    user: 'bob',
                    content: '<p>child</p>',
                    comments: [makeComment({ id: 3, user: 'carol', content: '<p>grandchild</p>' })],
                }),
            ],
        });

        renderWithProviders(<Comment comment={comment} />);

        expect(screen.getByRole('link', { name: 'bob' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'carol' })).toBeInTheDocument();
        expect(screen.getByText('grandchild')).toBeInTheDocument();
    });

    it('collapses and expands its own subtree only', async () => {
        const user = userEvent.setup();
        const comment = makeComment({
            comments: [makeComment({ id: 2, user: 'bob', content: '<p>child</p>' })],
        });

        const { container } = renderWithProviders(<Comment comment={comment} />);

        const toggle = container.querySelector('.collapse') as HTMLElement;
        expect(toggle.textContent).toBe('[-]');

        await user.click(toggle);

        expect(toggle.textContent).toBe('[+]');
        expect(container.querySelector('.meta')).toHaveClass('meta-collapse');
        expect(container.querySelector('.comment-tree > div')).toHaveAttribute('hidden');
        expect(container.querySelector('.subtree .comment .meta a')).toHaveTextContent('bob');

        await user.click(toggle);

        expect(toggle.textContent).toBe('[-]');
        expect(container.querySelector('.comment-tree > div')).not.toHaveAttribute('hidden');
    });

    it('renders a placeholder for deleted comments', () => {
        renderWithProviders(<Comment comment={makeComment({ deleted: true })} />);

        expect(screen.getByText('[deleted]')).toBeInTheDocument();
        expect(screen.getByText(/Comment Deleted/)).toBeInTheDocument();
        expect(screen.queryByRole('link', { name: 'alice' })).not.toBeInTheDocument();
    });
});
