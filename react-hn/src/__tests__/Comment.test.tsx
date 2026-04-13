import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Comment from '../components/Comment';
import { Comment as CommentModel } from '../models/comment';

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('Comment', () => {
  const mockComment: CommentModel = {
    id: 1,
    level: 0,
    user: 'testuser',
    time: 1234567890,
    time_ago: '2 hours ago',
    content: '<p>This is a test comment</p>',
    deleted: false,
    comments: [],
  };

  it('should render comment with user and time', () => {
    renderWithRouter(<Comment comment={mockComment} />);
    expect(screen.getByText('testuser')).toBeInTheDocument();
    expect(screen.getByText('2 hours ago')).toBeInTheDocument();
  });

  it('should render comment content as HTML', () => {
    renderWithRouter(<Comment comment={mockComment} />);
    expect(screen.getByText('This is a test comment')).toBeInTheDocument();
  });

  it('should toggle collapse on click', async () => {
    const user = userEvent.setup();
    renderWithRouter(<Comment comment={mockComment} />);

    const collapseButton = screen.getByText('[-]');
    expect(collapseButton).toBeInTheDocument();

    await user.click(collapseButton);
    expect(screen.getByText('[+]')).toBeInTheDocument();
  });

  it('should render deleted comment', () => {
    const deletedComment: CommentModel = {
      ...mockComment,
      deleted: true,
    };
    renderWithRouter(<Comment comment={deletedComment} />);
    expect(screen.getByText('[deleted]')).toBeInTheDocument();
    expect(screen.getByText(/Comment Deleted/)).toBeInTheDocument();
  });

  it('should render nested comments recursively', () => {
    const nestedComment: CommentModel = {
      ...mockComment,
      comments: [
        {
          id: 2,
          level: 1,
          user: 'nesteduser',
          time: 1234567891,
          time_ago: '1 hour ago',
          content: '<p>Nested comment</p>',
          deleted: false,
          comments: [],
        },
      ],
    };
    renderWithRouter(<Comment comment={nestedComment} />);
    expect(screen.getByText('nesteduser')).toBeInTheDocument();
    expect(screen.getByText('Nested comment')).toBeInTheDocument();
  });
});
