import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Comment from './Comment';
import { Comment as CommentModel } from '../models/comment';
import { renderWithProviders } from '../test/test-utils';

function makeComment(overrides: Partial<CommentModel> = {}): CommentModel {
  return {
    id: 1,
    level: 0,
    user: 'bob',
    time: 0,
    time_ago: '1 hour ago',
    content: '<p>hello world</p>',
    deleted: false,
    comments: [],
    ...overrides,
  };
}

describe('Comment', () => {
  it('renders content as HTML and the author link', () => {
    renderWithProviders(<Comment comment={makeComment()} />);
    expect(screen.getByText('hello world')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'bob' })).toHaveAttribute('href', '/user/bob');
  });

  it('renders nested child comments recursively', () => {
    const nested = makeComment({
      id: 1,
      user: 'parent',
      content: '<p>parent comment</p>',
      comments: [
        makeComment({ id: 2, user: 'child', content: '<p>child comment</p>' }),
      ],
    });
    renderWithProviders(<Comment comment={nested} />);
    expect(screen.getByText('parent comment')).toBeInTheDocument();
    expect(screen.getByText('child comment')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'child' })).toBeInTheDocument();
  });

  it('collapses and expands when the toggle is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Comment comment={makeComment()} />);

    expect(screen.getByText('[-]')).toBeInTheDocument();
    await user.click(screen.getByText('[-]'));
    expect(screen.getByText('[+]')).toBeInTheDocument();
  });

  it('renders the deleted state', () => {
    renderWithProviders(<Comment comment={makeComment({ deleted: true })} />);
    expect(screen.getByText(/Comment Deleted/)).toBeInTheDocument();
    expect(screen.getByText('[deleted]')).toBeInTheDocument();
  });
});
