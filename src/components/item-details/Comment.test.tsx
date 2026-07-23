import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import type { Comment as CommentModel } from '../../types/comment';
import { Comment } from './Comment';

function makeComment(overrides: Partial<CommentModel> = {}): CommentModel {
  return {
    id: 1,
    level: 0,
    user: 'alice',
    time: 0,
    time_ago: '2 hours ago',
    content: '<b>hello</b> world',
    deleted: false,
    comments: [],
    ...overrides,
  } as CommentModel;
}

function renderComment(comment: CommentModel) {
  return render(
    <MemoryRouter>
      <Comment comment={comment} />
    </MemoryRouter>
  );
}

describe('Comment', () => {
  it('renders the author, time and HTML content', () => {
    renderComment(makeComment());
    expect(screen.getByRole('link', { name: 'alice' })).toHaveAttribute('href', '/user/alice');
    expect(screen.getByText('2 hours ago')).toBeInTheDocument();
    expect(screen.getByText('hello').tagName).toBe('B');
  });

  it('recursively renders child comments', () => {
    const comment = makeComment({
      comments: [makeComment({ id: 2, user: 'bob', content: 'child reply' })],
    });
    renderComment(comment);
    expect(screen.getByRole('link', { name: 'bob' })).toBeInTheDocument();
    expect(screen.getByText('child reply')).toBeInTheDocument();
  });

  it('toggles collapse, hiding the body and children', async () => {
    const comment = makeComment({
      comments: [makeComment({ id: 2, user: 'bob', content: 'child reply' })],
    });
    renderComment(comment);

    expect(screen.getAllByText('[-]')).toHaveLength(2);
    expect(screen.getByText('child reply')).toBeVisible();

    await userEvent.click(screen.getAllByText('[-]')[0]);

    expect(screen.getByText('[+]')).toBeInTheDocument();
    expect(screen.getByText('child reply')).not.toBeVisible();
  });

  it('renders a deleted placeholder for deleted comments', () => {
    renderComment(makeComment({ deleted: true }));
    expect(screen.getByText('[deleted]')).toBeInTheDocument();
    expect(screen.getByText(/Comment Deleted/)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'alice' })).not.toBeInTheDocument();
  });
});
