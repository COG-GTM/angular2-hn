import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { Comment } from '../components/Comment';
import type { Comment as CommentModel } from '../types/models';

const comment: CommentModel = { id: 1, user: 'alice', time_ago: '1 hour ago', content: '<b>Hello</b>', deleted: false, comments: [] };

describe('Comment', () => {
  it('renders and collapses comment content', async () => {
    render(<BrowserRouter><Comment comment={comment} /></BrowserRouter>);
    expect(screen.getByText('Hello')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: '[-]' }));
    expect(screen.queryByText('Hello')).not.toBeVisible();
  });

  it('renders deleted comments', () => {
    render(<BrowserRouter><Comment comment={{ ...comment, deleted: true }} /></BrowserRouter>);
    expect(screen.getByText(/Comment Deleted/)).toBeInTheDocument();
  });
});
