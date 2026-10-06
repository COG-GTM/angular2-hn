import { fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Comment as CommentModel } from '../shared/models';
import { renderWithProviders } from '../test/renderWithProviders';
import { Comment } from './Comment';

function makeComment(overrides: Partial<CommentModel> = {}): CommentModel {
    return {
        id: 1,
        level: 0,
        user: 'alice',
        time: 0,
        time_ago: '2 hours ago',
        content: '<p>Top level</p>',
        comments: [],
        ...overrides,
    };
}

const tree = makeComment({
    comments: [
        makeComment({
            id: 2,
            level: 1,
            user: 'bob',
            content: '<p>Reply</p>',
            comments: [makeComment({ id: 3, level: 2, user: 'carol', content: '<p>Nested reply</p>' })],
        }),
        makeComment({ id: 4, level: 1, deleted: true, user: '', content: '' }),
    ],
});

describe('Comment', () => {
    it('renders meta, sanitized content and a link to the user', () => {
        const { container } = renderWithProviders(
            <Comment comment={makeComment({ content: '<p>Hi <i>there</i></p><script>alert(1)</script>' })} />
        );
        expect(container.querySelector('.meta')).not.toHaveClass('meta-collapse');
        expect(screen.getByRole('link', { name: 'alice' })).toHaveAttribute('href', '/user/alice');
        expect(container.querySelector('.time')).toHaveTextContent('2 hours ago');
        const text = container.querySelector('p.comment-text')!;
        expect(text.querySelector('i')).toHaveTextContent('there');
        expect(text.innerHTML).not.toMatch(/script/);
    });

    it('renders a nested comment tree', () => {
        const { container } = renderWithProviders(<Comment comment={tree} />);
        expect(container.querySelectorAll('.comment')).toHaveLength(4);
        const nested = container.querySelector('.subtree .subtree')!;
        expect(within(nested as HTMLElement).getByText('Nested reply')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'carol' })).toHaveAttribute('href', '/user/carol');
    });

    it('renders deleted comments', () => {
        const { container } = renderWithProviders(<Comment comment={makeComment({ deleted: true })} />);
        expect(container.querySelector('.deleted-meta')).toHaveTextContent('[deleted] | Comment Deleted');
        expect(container.querySelector('.meta')).toBeNull();
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('collapses and expands on click, keeping the subtree mounted', async () => {
        const user = userEvent.setup();
        const { container } = renderWithProviders(<Comment comment={tree} />);
        const toggle = screen.getByRole('button', { name: 'Collapse comment by alice' });
        expect(toggle).toHaveTextContent('[-]');
        expect(toggle).toHaveAttribute('aria-expanded', 'true');

        await user.click(toggle);
        expect(toggle).toHaveTextContent('[+]');
        expect(toggle).toHaveAttribute('aria-expanded', 'false');
        expect(toggle).toHaveAccessibleName('Expand comment by alice');
        expect(container.querySelector('.meta')).toHaveClass('meta-collapse');
        const body = container.querySelector('.comment-tree > div')!;
        expect(body).not.toBeVisible();
        expect(body).toHaveAttribute('hidden');
        expect(body.querySelector('.subtree')).toHaveTextContent('Nested reply');

        await user.click(toggle);
        expect(toggle).toHaveTextContent('[-]');
        expect(body).toBeVisible();
    });

    it('only collapses its own subtree', async () => {
        const user = userEvent.setup();
        renderWithProviders(<Comment comment={tree} />);
        await user.click(screen.getByRole('button', { name: 'Collapse comment by bob' }));
        expect(screen.getByText('Top level')).toBeVisible();
        expect(screen.getByText('Reply')).not.toBeVisible();
        expect(screen.getByRole('button', { name: 'Collapse comment by alice' })).toHaveTextContent('[-]');
    });

    it('toggles with Enter and Space and ignores other keys', async () => {
        const user = userEvent.setup();
        renderWithProviders(<Comment comment={tree} />);
        const toggle = screen.getByRole('button', { name: 'Collapse comment by alice' });
        expect(toggle).toHaveAttribute('tabindex', '0');

        toggle.focus();
        await user.keyboard('{Enter}');
        expect(toggle).toHaveTextContent('[+]');
        await user.keyboard(' ');
        expect(toggle).toHaveTextContent('[-]');
        fireEvent.keyDown(toggle, { key: 'a' });
        expect(toggle).toHaveTextContent('[-]');
    });
});
