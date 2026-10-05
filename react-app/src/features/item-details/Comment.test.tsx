import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { makeComment } from '../../test/fixtures';
import { renderWithProviders } from '../../test/render';
import { Comment } from './Comment';

const tree = makeComment({
  id: 1,
  user: 'bob',
  time_ago: '1 hour ago',
  content: '<p>Top <a href="https://example.com">link</a></p>',
  comments: [
    makeComment({
      id: 2,
      user: 'carol',
      content: '<p>Reply</p>',
      comments: [makeComment({ id: 3, user: 'dave', content: '<p>Deep reply</p>' })],
    }),
    makeComment({ id: 4, deleted: true, user: '', content: '' }),
  ],
});

describe('Comment', () => {
  it('renders author, time and HTML content', () => {
    const { container } = renderWithProviders(<Comment comment={tree} />);
    const meta = container.querySelector('.meta')!;
    expect(meta).toHaveTextContent('[-]bob1 hour ago');
    expect(screen.getByRole('link', { name: 'bob' })).toHaveAttribute('href', '/user/bob');
    expect(container.querySelector('.comment-text')!.innerHTML).toBe(
      '<p>Top <a href="https://example.com">link</a></p>'
    );
  });

  it('renders replies recursively in nested subtrees', () => {
    renderWithProviders(<Comment comment={tree} />);
    const dave = screen.getByRole('link', { name: 'dave' });
    const carol = screen.getByRole('link', { name: 'carol' });
    expect(carol.closest('.subtree')).not.toBeNull();
    expect(dave.closest('.subtree')!.parentElement!.closest('.subtree')).toBe(carol.closest('.subtree'));
    expect(screen.getByText('Deep reply')).toBeInTheDocument();
  });

  it('renders deleted comments as "Comment Deleted"', () => {
    const { container } = renderWithProviders(<Comment comment={tree} />);
    const deleted = container.querySelectorAll('.deleted-meta');
    expect(deleted).toHaveLength(1);
    expect(deleted[0]).toHaveTextContent('[deleted] | Comment Deleted');
  });

  it('collapses and expands the comment and its replies', async () => {
    const user = userEvent.setup();
    const { container } = renderWithProviders(<Comment comment={tree} />);
    const toggle = container.querySelector('.meta > .collapse')!;
    const body = container.querySelector('.comment-tree > div')!;

    expect(body).toBeVisible();
    await user.click(toggle);
    expect(toggle).toHaveTextContent('[+]');
    expect(container.querySelector('.meta')).toHaveClass('meta-collapse');
    expect(body).not.toBeVisible();
    expect(screen.getByText('Reply')).not.toBeVisible();

    await user.click(toggle);
    expect(toggle).toHaveTextContent('[-]');
    expect(container.querySelector('.meta')).not.toHaveClass('meta-collapse');
    expect(body).toBeVisible();
  });

  it('collapses a reply independently of its parent', async () => {
    const user = userEvent.setup();
    const { container } = renderWithProviders(<Comment comment={tree} />);
    const toggles = container.querySelectorAll('.meta > .collapse');
    await user.click(toggles[1]);
    expect(screen.getByText('Deep reply')).not.toBeVisible();
    expect(screen.getByText('Reply')).not.toBeVisible();
    expect(screen.getByText('link')).toBeVisible();
  });
});
