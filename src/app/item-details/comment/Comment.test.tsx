import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { makeComment } from '../../../test/fixtures';
import { renderWithProviders } from '../../../test/renderWithProviders';
import { Comment } from './Comment';

describe('Comment', () => {
  it('renders the author, age and html content', () => {
    renderWithProviders(<Comment comment={makeComment()} />);

    expect(screen.getByRole('link', { name: 'sophie' })).toHaveAttribute('href', '/user/sophie');
    expect(screen.getByText('1 hour ago')).toBeInTheDocument();
    expect(screen.getByText('Nice write-up')).toBeInTheDocument();
  });

  it('collapses and expands the thread', async () => {
    const user = userEvent.setup();
    const comment = makeComment({ comments: [makeComment({ id: 101, user: 'reply', content: 'a reply' })] });
    const { container } = renderWithProviders(<Comment comment={comment} />);

    const toggle = () => container.querySelector('.comment-view > .meta > .collapse') as HTMLElement;

    expect(toggle()).toHaveTextContent('[-]');
    expect(container.querySelector('.comment-tree > div')).not.toHaveAttribute('hidden');

    await user.click(toggle());

    expect(toggle()).toHaveTextContent('[+]');
    expect(container.querySelector('.comment-tree > div')).toHaveAttribute('hidden');
    expect(container.querySelector('.meta')).toHaveClass('meta-collapse');

    await user.click(toggle());
    expect(container.querySelector('.comment-tree > div')).not.toHaveAttribute('hidden');
  });

  it('renders nested replies recursively', () => {
    const comment = makeComment({
      comments: [
        makeComment({
          id: 101,
          user: 'child',
          content: 'first level',
          comments: [makeComment({ id: 102, user: 'grandchild', content: 'second level' })],
        }),
      ],
    });
    renderWithProviders(<Comment comment={comment} />);

    expect(screen.getByRole('link', { name: 'child' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'grandchild' })).toBeInTheDocument();
    expect(screen.getByText('second level')).toBeInTheDocument();
  });

  it('marks deleted comments', () => {
    renderWithProviders(<Comment comment={makeComment({ deleted: true })} />);

    expect(screen.getByText('[deleted]')).toBeInTheDocument();
    expect(screen.getByText(/Comment Deleted/)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'sophie' })).toBeNull();
  });
});
