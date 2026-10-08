import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { makeComment } from '../test/fixtures';
import { renderWithProviders } from '../test/utils';
import { Comment } from './Comment';

describe('Comment', () => {
    it('renders the meta line and sanitized content', () => {
        const { container } = renderWithProviders(
            <Comment comment={makeComment({ content: '<p>Hello <i>world</i></p>' })} />
        );
        const meta = container.querySelector('.meta')!;
        expect(meta).not.toHaveClass('meta-collapse');
        expect(meta.querySelector('.collapse')).toHaveTextContent('[-]');
        expect(meta.querySelector('a')).toHaveAttribute('href', '/user/dang');
        expect(meta.querySelector('.time')).toHaveTextContent('1 hour ago');
        expect(meta.textContent).toBe('[-]dang1 hour ago');
        expect(container.querySelector('p.comment-text')!.innerHTML).toBe('<p>Hello <i>world</i></p>');
    });

    it('strips XSS payloads from comment content', () => {
        const { container } = renderWithProviders(
            <Comment
                comment={makeComment({
                    content:
                        '<p>ok</p><img src=x onerror="alert(1)"><script>alert(1)</script><a href="javascript:alert(1)" onclick="x()">link</a><iframe src="https://evil"></iframe>',
                })}
            />
        );
        const text = container.querySelector('p.comment-text')!;
        expect(text).toHaveTextContent('ok');
        expect(text).toHaveTextContent('link');
        expect(text.innerHTML).not.toMatch(/script|onerror|onclick|javascript|<img|<iframe/);
    });

    it('recursively renders nested replies', () => {
        const tree = makeComment({
            id: 1,
            user: 'a',
            comments: [
                makeComment({
                    id: 2,
                    user: 'b',
                    comments: [makeComment({ id: 3, user: 'c', comments: [makeComment({ id: 4, user: 'd' })] })],
                }),
                makeComment({ id: 5, user: 'e' }),
            ],
        });
        const { container } = renderWithProviders(<Comment comment={tree} />);
        ['a', 'b', 'c', 'd', 'e'].forEach((user) =>
            expect(screen.getByRole('link', { name: user })).toBeInTheDocument()
        );
        const d = screen.getByRole('link', { name: 'd' });
        expect(d.closest('ul.subtree')!.closest('ul.subtree')!.closest('ul.subtree')).toBeInTheDocument();
        expect(container.querySelectorAll('ul.subtree > li')).toHaveLength(4);
    });

    it('collapses and expands the subtree', async () => {
        const tree = makeComment({
            id: 1,
            content: '<p>parent text</p>',
            comments: [makeComment({ id: 2, user: 'child', content: '<p>child text</p>' })],
        });
        const { container } = renderWithProviders(<Comment comment={tree} />);
        const toggle = container.querySelector('.meta > .collapse')!;
        const body = container.querySelector('.comment-tree > div')!;
        expect(body).not.toHaveAttribute('hidden');
        expect(screen.getByText('child text')).toBeVisible();

        await userEvent.click(toggle);
        expect(toggle).toHaveTextContent('[+]');
        expect(container.querySelector('.meta')).toHaveClass('meta-collapse');
        expect(body).toHaveAttribute('hidden');
        expect(screen.getByText('parent text')).not.toBeVisible();
        expect(screen.getByText('child text')).not.toBeVisible();
        expect(container.querySelector('.meta a')).toBeVisible();

        await userEvent.click(toggle);
        expect(toggle).toHaveTextContent('[-]');
        expect(body).not.toHaveAttribute('hidden');
        expect(screen.getByText('child text')).toBeVisible();
    });

    it('toggles collapse from the keyboard with aria-expanded', async () => {
        const { container } = renderWithProviders(<Comment comment={makeComment({ content: '<p>parent text</p>' })} />);
        const toggle = screen.getByRole('button', { name: 'Collapse comment' });
        expect(toggle).toHaveAttribute('aria-expanded', 'true');
        toggle.focus();
        await userEvent.keyboard('{Enter}');
        expect(toggle).toHaveAttribute('aria-expanded', 'false');
        expect(toggle).toHaveAccessibleName('Expand comment');
        expect(container.querySelector('.comment-tree > div')).toHaveAttribute('hidden');
        await userEvent.keyboard(' ');
        expect(container.querySelector('.comment-tree > div')).not.toHaveAttribute('hidden');
    });

    it('collapses a reply independently of its parent', async () => {
        const tree = makeComment({
            id: 1,
            comments: [
                makeComment({ id: 2, user: 'child', comments: [makeComment({ id: 3, content: '<p>grandchild</p>' })] }),
            ],
        });
        const { container } = renderWithProviders(<Comment comment={tree} />);
        const toggles = container.querySelectorAll('.meta > .collapse');
        await userEvent.click(toggles[1]);
        expect(screen.getByText('grandchild')).not.toBeVisible();
        expect(screen.getByRole('link', { name: 'child' })).toBeVisible();
        expect(toggles[0]).toHaveTextContent('[-]');
    });

    it('renders deleted comments', () => {
        const { container } = renderWithProviders(
            <Comment comment={makeComment({ deleted: true, content: '<p>secret</p>' })} />
        );
        const meta = container.querySelector('.deleted-meta')!;
        expect(meta).toHaveTextContent('[deleted] | Comment Deleted');
        expect(meta.querySelector('.collapse')).toHaveTextContent('[deleted]');
        expect(container.querySelector('.meta')).not.toBeInTheDocument();
        expect(container.querySelector('.comment-text')).not.toBeInTheDocument();
        expect(screen.queryByText('secret')).not.toBeInTheDocument();
    });
});
