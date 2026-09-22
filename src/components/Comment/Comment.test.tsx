import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { makeComment } from '../../test/fixtures';
import { renderWithProviders } from '../../test/render';
import { Comment } from './Comment';

describe('Comment', () => {
  it('renders the comment html and its replies', () => {
    const comment = makeComment({
      comments: [makeComment({ id: 11, user: 'bob', content: '<p>Reply</p>' })],
    });
    renderWithProviders(<Comment comment={comment} />);

    expect(screen.getByText('Top level comment')).toBeInTheDocument();
    expect(screen.getByText('Reply')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'bob' })).toHaveAttribute('href', '/user/bob');
  });

  it('collapses and expands the subtree', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Comment comment={makeComment()} />);

    await user.click(screen.getByText('[-]'));
    expect(screen.getByText('Top level comment')).not.toBeVisible();

    await user.click(screen.getByText('[+]'));
    expect(screen.getByText('Top level comment')).toBeVisible();
  });

  it('renders a placeholder for deleted comments', () => {
    renderWithProviders(<Comment comment={makeComment({ deleted: true })} />);

    expect(screen.getByText('[deleted]')).toBeInTheDocument();
    expect(screen.queryByText('Top level comment')).not.toBeInTheDocument();
  });
});
