import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '../../test';
import { Comment } from './Comment';
import { makeComment } from './fixtures';

describe('Comment', () => {
    it('renders meta (user link, time) and sanitized content', () => {
        const { container } = renderWithProviders(
            <Comment
                comment={makeComment({
                    content: '<p onclick="x()">Hi <a href="item?id=5">there</a><script>bad()</script></p>',
                })}
            />
        );
        expect(screen.getByRole('link', { name: 'alice' })).toHaveAttribute('href', '/user/alice');
        expect(screen.getByText('2 hours ago')).toHaveClass('time');
        const text = container.querySelector('.comment-text')!;
        expect(text.innerHTML).not.toContain('script');
        expect(text.innerHTML).not.toContain('onclick');
        expect(within(text as HTMLElement).getByRole('link', { name: 'there' })).toHaveAttribute(
            'href',
            'https://news.ycombinator.com/item?id=5'
        );
    });

    it('renders a deep comment tree recursively', () => {
        const deepest = makeComment({ id: 4, user: 'dave', level: 3 });
        const tree = makeComment({
            id: 1,
            comments: [
                makeComment({
                    id: 2,
                    user: 'bob',
                    level: 1,
                    comments: [makeComment({ id: 3, user: 'carol', level: 2, comments: [deepest] })],
                }),
            ],
        });
        const { container } = renderWithProviders(<Comment comment={tree} />);
        for (const user of ['alice', 'bob', 'carol', 'dave']) {
            expect(screen.getByRole('link', { name: user })).toBeInTheDocument();
        }
        expect(container.querySelectorAll('.app-comment')).toHaveLength(4);
        expect(container.querySelectorAll('ul.subtree > li')).toHaveLength(3);
    });

    it('collapses and expands with [-]/[+] (mouse and keyboard), hiding text and children', async () => {
        const tree = makeComment({ comments: [makeComment({ id: 2, user: 'bob' })] });
        const { container, user } = renderWithProviders(<Comment comment={tree} />);
        const toggle = screen.getByRole('button', { name: 'Collapse comment by alice' });
        const body = container.querySelector('.comment-tree > div')!;
        expect(toggle).toHaveTextContent('[-]');
        expect(body).not.toHaveAttribute('hidden');

        await user.click(toggle);
        expect(toggle).toHaveTextContent('[+]');
        expect(toggle).toHaveAttribute('aria-expanded', 'false');
        expect(body).toHaveAttribute('hidden');
        expect(container.querySelector('.meta')).toHaveClass('meta-collapse');
        expect(screen.getByRole('link', { name: 'bob', hidden: true })).not.toBeVisible();

        toggle.focus();
        await user.keyboard('{Enter}');
        expect(toggle).toHaveTextContent('[-]');
        expect(body).not.toHaveAttribute('hidden');
        await user.keyboard(' ');
        expect(toggle).toHaveTextContent('[+]');
    });

    it('collapse state is local to each comment', async () => {
        const tree = makeComment({ comments: [makeComment({ id: 2, user: 'bob' })] });
        const { user } = renderWithProviders(<Comment comment={tree} />);
        await user.click(screen.getByRole('button', { name: 'Collapse comment by bob' }));
        expect(screen.getByRole('button', { name: 'Expand comment by bob' })).toHaveTextContent('[+]');
        expect(screen.getByRole('button', { name: 'Collapse comment by alice' })).toHaveTextContent('[-]');
    });

    it('renders the deleted placeholder', () => {
        const { container } = renderWithProviders(<Comment comment={makeComment({ deleted: true, user: '' })} />);
        expect(container.querySelector('.deleted-meta')).toHaveTextContent('[deleted] | Comment Deleted');
        expect(container.querySelector('.meta')).toBeNull();
        expect(screen.queryByRole('button')).toBeNull();
    });
});
