import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { Comment as CommentModel } from '../../models';
import { renderWithProviders } from '../../test/renderWithProviders';
import Comment from './Comment';

const reply: CommentModel = { id: 2, level: 1, user: 'bob', time: 0, time_ago: '1h', content: 'reply', comments: [] };
const comment: CommentModel = { ...reply, id: 1, level: 0, user: 'alice', time_ago: '2 hours ago', comments: [reply] };
const renderComment = (c = comment) => renderWithProviders(<Comment comment={{ ...c, content: '<i>top</i>' }} />);

describe('Comment', () => {
  it('renders the meta, HTML content and nested replies', () => {
    const { container } = renderComment();
    expect(screen.getByRole('link', { name: 'alice' })).toHaveAttribute('href', '/user/alice');
    expect(screen.getByText('2 hours ago')).toHaveClass('time');
    expect(container.querySelector('.comment-text i')).toHaveTextContent('top');
    expect(screen.getByRole('link', { name: 'bob' })).toHaveAttribute('href', '/user/bob');
    expect(screen.getByText('reply')).toBeVisible();
  });

  it('collapses and expands its subtree', async () => {
    const { container } = renderComment();
    const [toggle] = screen.getAllByText('[-]');
    await userEvent.click(toggle);
    expect(toggle).toHaveTextContent('[+]');
    expect(container.querySelector('.meta')).toHaveClass('meta-collapse');
    expect(screen.getByText('top')).not.toBeVisible();
    expect(screen.getByText('reply')).not.toBeVisible();
    expect(screen.getByRole('link', { name: 'alice' })).toBeVisible();
    await userEvent.click(toggle);
    expect(toggle).toHaveTextContent('[-]');
    expect(container.querySelector('.meta')).not.toHaveClass('meta-collapse');
    expect(screen.getByText('reply')).toBeVisible();
  });

  it('collapses a nested reply independently', async () => {
    renderComment();
    await userEvent.click(screen.getAllByText('[-]')[1]);
    expect(screen.getByText('reply')).not.toBeVisible();
    expect(screen.getByText('top')).toBeVisible();
  });

  it('renders the deleted state', () => {
    const { container } = renderComment({ ...comment, deleted: true });
    expect(container.querySelector('.deleted-meta')).toHaveTextContent('[deleted] | Comment Deleted');
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
