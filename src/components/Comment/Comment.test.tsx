import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import { Comment } from './Comment';
import { makeComment } from '../../test/fixtures';

function renderInRouter(ui: ReactElement) {
    return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('Comment', () => {
    it('renders the author, time and content HTML', () => {
        renderInRouter(
            <Comment comment={makeComment({ user: 'alice', time_ago: '3 hours ago', content: '<em>hello</em>' })} />
        );
        expect(screen.getByRole('link', { name: 'alice' })).toHaveAttribute('href', '/user/alice');
        expect(screen.getByText('3 hours ago')).toBeInTheDocument();
        expect(screen.getByText('hello').tagName).toBe('EM');
    });

    it('recursively renders child comments', () => {
        const comment = makeComment({
            id: 1,
            user: 'parent',
            comments: [makeComment({ id: 2, user: 'child', comments: [makeComment({ id: 3, user: 'grandchild' })] })],
        });
        renderInRouter(<Comment comment={comment} />);
        expect(screen.getByRole('link', { name: 'parent' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'child' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'grandchild' })).toBeInTheDocument();
    });

    it('collapses and expands when the toggle is clicked', () => {
        const { container } = renderInRouter(<Comment comment={makeComment()} />);
        const toggle = screen.getByText('[-]');
        const tree = container.querySelector('.comment-tree > div') as HTMLElement;
        expect(tree).not.toHaveAttribute('hidden');

        fireEvent.click(toggle);
        expect(screen.getByText('[+]')).toBeInTheDocument();
        expect(container.querySelector('.comment-tree > div')).toHaveAttribute('hidden');

        fireEvent.click(screen.getByText('[+]'));
        expect(screen.getByText('[-]')).toBeInTheDocument();
        expect(container.querySelector('.comment-tree > div')).not.toHaveAttribute('hidden');
    });

    it('renders a placeholder for deleted comments', () => {
        renderInRouter(<Comment comment={makeComment({ deleted: true })} />);
        expect(screen.getByText(/Comment Deleted/)).toBeInTheDocument();
        expect(screen.getByText('[deleted]')).toBeInTheDocument();
        expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });
});
