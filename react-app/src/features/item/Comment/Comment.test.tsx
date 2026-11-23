import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import type { Comment as CommentModel } from '../../../api/types';
import { Comment } from './Comment';

const reply: CommentModel = { id: 2, level: 1, user: 'bob', time: 0, time_ago: '1 hour ago', content: '<p>reply text</p>', comments: [] };
const root: CommentModel = {
  id: 1, level: 0, user: 'alice', time: 0, time_ago: '2 hours ago',
  content: 'root <a href="https://example.com">text</a>', comments: [reply],
};

const renderComment = (comment: CommentModel) => render(<MemoryRouter><Comment comment={comment} /></MemoryRouter>);

describe('Comment', () => {
  it('renders author, time, HTML content and nested replies', () => {
    const { container } = renderComment(root);
    expect(screen.getByRole('link', { name: 'alice' })).toHaveAttribute('href', '/user/alice');
    expect(container.querySelector('.meta .time')).toHaveTextContent('2 hours ago');
    expect(screen.getByRole('link', { name: 'text' })).toHaveAttribute('href', 'https://example.com');
    const subtree = container.querySelector('.subtree') as HTMLElement;
    expect(within(subtree).getByRole('link', { name: 'bob' })).toHaveAttribute('href', '/user/bob');
    expect(within(subtree).getByText('reply text')).toBeInTheDocument();
  });

  it('[-] collapses the text and replies, [+] expands them', async () => {
    const { container } = renderComment(root);
    const toggle = container.querySelector('.collapse') as HTMLElement;
    expect(toggle).toHaveTextContent('[-]');
    await userEvent.click(toggle);
    expect(toggle).toHaveTextContent('[+]');
    expect(container.querySelector('.meta')).toHaveClass('meta-collapse');
    expect(container.querySelector('.comment-text')).not.toBeVisible();
    expect(screen.getByText('reply text')).not.toBeVisible();
    await userEvent.click(toggle);
    expect(toggle).toHaveTextContent('[-]');
    expect(container.querySelector('.comment-text')).toBeVisible();
  });

  it('toggles from the keyboard', async () => {
    const { container } = renderComment(root);
    const toggle = screen.getAllByRole('button')[0];
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    toggle.focus();
    await userEvent.keyboard('{Enter}');
    expect(toggle).toHaveTextContent('[+]');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await userEvent.keyboard(' ');
    expect(container.querySelector('.comment-text')).toBeVisible();
  });

  it('collapsing a reply leaves its parent expanded', async () => {
    const { container } = renderComment(root);
    const [, replyToggle] = container.querySelectorAll<HTMLElement>('.collapse');
    await userEvent.click(replyToggle);
    expect(replyToggle).toHaveTextContent('[+]');
    expect(container.querySelector('.collapse')).toHaveTextContent('[-]');
    expect(screen.getByText('root')).toBeVisible();
    expect(screen.getByText('reply text')).not.toBeVisible();
  });

  it('shows a placeholder for deleted comments', () => {
    const { container } = renderComment({ ...root, deleted: true });
    expect(container.querySelector('.deleted-meta')).toHaveTextContent('[deleted] | Comment Deleted');
    expect(container.querySelector('.meta')).toBeNull();
    expect(screen.queryByText('alice')).toBeNull();
  });
});
