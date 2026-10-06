import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { makeComment } from '../../test/fixtures';
import { renderWithProviders } from '../../test/render';
import { Comment } from './Comment';

const tree = makeComment({
    id: 1,
    user: 'root',
    content: '<p>Root text</p>',
    comments: [
        makeComment({
            id: 2,
            user: 'child',
            content: '<p>Child text</p>',
            comments: [makeComment({ id: 3, user: 'grandchild', content: 'Grandchild <i>text</i>' })],
        }),
        makeComment({ id: 4, deleted: true, user: '', content: '' }),
    ],
});

describe('Comment', () => {
    it('renders the comment tree recursively with HTML content', () => {
        const { container } = renderWithProviders(<Comment comment={tree} />);
        expect(screen.getByRole('link', { name: 'root' })).toHaveAttribute('href', '/user/root');
        expect(screen.getByRole('link', { name: 'child' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'grandchild' })).toBeInTheDocument();
        expect(container.querySelector('i')).toHaveTextContent('text');
        const childText = screen.getByText('Child text');
        expect(childText.closest('.subtree')).not.toBeNull();
        expect(screen.getByText('Grandchild').closest('.subtree')?.closest('.subtree')).not.toBeNull();
        expect(container.querySelectorAll('.comment')).toHaveLength(4);
    });

    it('renders deleted comments', () => {
        const { container } = renderWithProviders(<Comment comment={tree} />);
        const deleted = container.querySelector('.deleted-meta');
        expect(deleted).toHaveTextContent('[deleted] | Comment Deleted');
    });

    it('collapses and expands a comment subtree', async () => {
        const user = userEvent.setup();
        renderWithProviders(<Comment comment={tree} />);
        const [rootToggle, childToggle] = screen.getAllByRole('button');
        expect(rootToggle).toHaveTextContent('[-]');

        await user.click(childToggle);
        expect(childToggle).toHaveTextContent('[+]');
        expect(childToggle.parentElement).toHaveClass('meta-collapse');
        expect(screen.getByText('Child text')).not.toBeVisible();
        expect(screen.getByText('Root text')).toBeVisible();

        await user.click(rootToggle);
        expect(rootToggle).toHaveTextContent('[+]');
        expect(screen.getByText('Root text')).not.toBeVisible();

        await user.click(rootToggle);
        expect(rootToggle).toHaveTextContent('[-]');
        expect(screen.getByText('Root text')).toBeVisible();
        expect(screen.getByText('Child text')).not.toBeVisible();
    });
});
