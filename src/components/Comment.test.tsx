import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test/utils';
import Comment from './Comment';
import { makeComment } from '../test/fixtures';

describe('Comment', () => {
    it('renders the comment content and author', () => {
        const comment = makeComment({ user: 'bob', content: '<p>Hello world</p>' });
        renderWithProviders(<Comment comment={comment} />);
        expect(screen.getByRole('link', { name: 'bob' })).toBeInTheDocument();
        expect(screen.getByText('Hello world')).toBeInTheDocument();
    });

    it('renders nested/recursive comments', () => {
        const comment = makeComment({
            id: 1,
            user: 'parent',
            content: '<p>Parent</p>',
            comments: [makeComment({ id: 2, user: 'child', content: '<p>Child</p>', comments: [] })],
        });
        renderWithProviders(<Comment comment={comment} />);
        expect(screen.getByText('Parent')).toBeInTheDocument();
        expect(screen.getByText('Child')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'child' })).toBeInTheDocument();
    });

    it('collapses and expands the subtree with the toggle', async () => {
        const user = userEvent.setup();
        const comment = makeComment({ id: 1, content: '<p>Body text</p>' });
        const { container } = renderWithProviders(<Comment comment={comment} />);

        const toggle = screen.getByText('[-]');
        const tree = container.querySelector('.comment-tree > div') as HTMLElement;
        expect(tree.hidden).toBe(false);

        await user.click(toggle);
        expect(screen.getByText('[+]')).toBeInTheDocument();
        expect((container.querySelector('.comment-tree > div') as HTMLElement).hidden).toBe(true);

        await user.click(screen.getByText('[+]'));
        expect(screen.getByText('[-]')).toBeInTheDocument();
        expect((container.querySelector('.comment-tree > div') as HTMLElement).hidden).toBe(false);
    });

    it('renders the deleted placeholder for deleted comments', () => {
        const comment = makeComment({ deleted: true, content: '' });
        renderWithProviders(<Comment comment={comment} />);
        expect(screen.getByText('[deleted]')).toBeInTheDocument();
        expect(screen.getByText(/Comment Deleted/)).toBeInTheDocument();
    });
});
