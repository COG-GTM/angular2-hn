import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import Comment from './Comment';
import { Comment as CommentModel } from '../../models/comment';

function makeComment(
  id: number,
  overrides: Partial<CommentModel> = {}
): CommentModel {
  return {
    id,
    level: 0,
    user: `user${id}`,
    time: 0,
    time_ago: '1 hour ago',
    content: `content ${id}`,
    deleted: false,
    comments: [],
    ...overrides,
  };
}

function renderComment(comment: CommentModel) {
  return render(
    <MemoryRouter>
      <Comment comment={comment} />
    </MemoryRouter>
  );
}

describe('Comment', () => {
  it('renders nested subcomments recursively', () => {
    const child = makeComment(2, { user: 'childuser', content: 'child content' });
    const parent = makeComment(1, {
      user: 'parentuser',
      content: 'parent content',
      comments: [child],
    });

    renderComment(parent);

    expect(screen.getByText('parentuser')).toBeInTheDocument();
    expect(screen.getByText('parent content')).toBeInTheDocument();
    expect(screen.getByText('childuser')).toBeInTheDocument();
    expect(screen.getByText('child content')).toBeInTheDocument();
  });

  it('toggles collapse when the toggle is clicked', async () => {
    renderComment(makeComment(1, { content: 'my content' }));

    expect(screen.getByText('[-]')).toBeInTheDocument();

    await userEvent.click(screen.getByText('[-]'));

    expect(screen.getByText('[+]')).toBeInTheDocument();
    expect(screen.queryByText('[-]')).not.toBeInTheDocument();
  });

  it('renders the deleted branch when the comment is deleted', () => {
    renderComment(makeComment(1, { deleted: true }));

    expect(screen.getByText('[deleted]')).toBeInTheDocument();
    expect(screen.getByText(/Comment Deleted/)).toBeInTheDocument();
  });
});
