import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { Comment as CommentModel } from '../../models/comment';
import { Comment } from './Comment';

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

const nested = makeComment({
  comments: [
    makeComment({
      id: 2,
      user: 'bob',
      content: '<p>child</p>',
      comments: [makeComment({ id: 3, user: 'carol', content: '<p>grandchild</p>', comments: [] })],
    }),
  ],
});

function renderComment(comment: CommentModel) {
  return render(
    <MemoryRouter>
      <Comment comment={comment} />
    </MemoryRouter>
  );
}

describe('Comment', () => {
  it('renders nested comments recursively', () => {
    renderComment(nested);

    expect(screen.getByText('top level')).toBeInTheDocument();
    expect(screen.getByText('child')).toBeInTheDocument();
    expect(screen.getByText('grandchild')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'carol' })).toHaveAttribute('href', '/user/carol');
  });

  it('toggles collapse state', async () => {
    const user = userEvent.setup();
    const { container } = renderComment(nested);

    const toggle = container.querySelector('.collapse') as HTMLElement;
    expect(toggle).toHaveTextContent('[-]');
    expect(container.querySelector('.meta')).not.toHaveClass('meta-collapse');
    expect(container.querySelector('.comment-tree > div')).not.toHaveAttribute('hidden');

    await user.click(toggle);

    expect(container.querySelector('.collapse')).toHaveTextContent('[+]');
    expect(container.querySelector('.meta')).toHaveClass('meta-collapse');
    expect(container.querySelector('.comment-tree > div')).toHaveAttribute('hidden');

    await user.click(container.querySelector('.collapse') as HTMLElement);

    expect(container.querySelector('.collapse')).toHaveTextContent('[-]');
    expect(container.querySelector('.comment-tree > div')).not.toHaveAttribute('hidden');
  });

  it('renders the deleted state', () => {
    const { container } = renderComment(makeComment({ deleted: true }));

    expect(container.querySelector('.deleted-meta')).toHaveTextContent('[deleted] | Comment Deleted');
    expect(screen.queryByRole('link')).toBeNull();
  });
});
