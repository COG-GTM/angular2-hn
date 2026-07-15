import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from './testUtils';
import { Comment } from '../../src/components/item-details/Comment';
import type { Comment as CommentModel } from '../../src/models/comment';

const nested: CommentModel = {
  id: 1,
  level: 0,
  user: 'bob',
  time: 1,
  time_ago: '1 hour ago',
  content: '<p>Parent comment</p>',
  deleted: false,
  comments: [
    {
      id: 2,
      level: 1,
      user: 'carol',
      time: 2,
      time_ago: '30 minutes ago',
      content: '<p>Child comment</p>',
      deleted: false,
      comments: [],
    },
  ],
};

describe('Comment', () => {
  it('renders the user, time and nested subcomment', () => {
    renderWithProviders(<Comment comment={nested} />);
    expect(screen.getByText('bob')).toBeInTheDocument();
    expect(screen.getByText('1 hour ago')).toBeInTheDocument();
    expect(screen.getByText('Parent comment')).toBeInTheDocument();
    expect(screen.getByText('Child comment')).toBeInTheDocument();
  });

  it('toggles collapse when the [-] control is clicked', async () => {
    const { container } = renderWithProviders(<Comment comment={nested} />);
    const toggle = screen.getAllByText('[-]')[0];
    expect(container.querySelector('.comment-tree > div')?.hasAttribute('hidden')).toBe(false);
    await userEvent.click(toggle);
    expect(screen.getAllByText('[+]')[0]).toBeInTheDocument();
    expect(container.querySelector('.comment-tree > div')?.hasAttribute('hidden')).toBe(true);
  });

  it('renders a deleted placeholder for deleted comments', () => {
    renderWithProviders(
      <Comment
        comment={{ ...nested, deleted: true, user: '', content: '', comments: [] }}
      />
    );
    expect(screen.getByText('[deleted]')).toBeInTheDocument();
    expect(screen.getByText(/Comment Deleted/)).toBeInTheDocument();
  });
});
