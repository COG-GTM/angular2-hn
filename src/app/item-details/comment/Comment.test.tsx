import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { makeComment } from '../../../test/fixtures';
import { renderWithProviders } from '../../../test/utils';
import { Comment } from './Comment';

describe('Comment', () => {
  const tree = makeComment({
    comments: [makeComment({ id: 101, user: 'bob', content: 'Nested reply', comments: [] })],
  });

  it('renders the author, time, content and nested replies', () => {
    renderWithProviders(<Comment comment={tree} />);

    expect(screen.getByRole('link', { name: 'alice' })).toHaveAttribute('href', '/user/alice');
    expect(screen.getAllByText('1 hour ago')).toHaveLength(2);
    expect(screen.getByText('Top level comment')).toBeInTheDocument();
    expect(screen.getByText('Nested reply')).toBeInTheDocument();
  });

  it('collapses and expands the comment subtree', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Comment comment={tree} />);

    const [toggle] = screen.getAllByText('[-]');
    await user.click(toggle);
    expect(screen.getByText('[+]')).toBeInTheDocument();
    expect(screen.getByText('Top level comment')).not.toBeVisible();
    expect(screen.getByText('Nested reply')).not.toBeVisible();

    await user.click(screen.getByText('[+]'));
    expect(screen.getByText('Top level comment')).toBeVisible();
  });

  it('renders deleted comments as placeholders', () => {
    renderWithProviders(<Comment comment={makeComment({ deleted: true })} />);

    expect(screen.getByText('[deleted]')).toBeInTheDocument();
    expect(screen.queryByText('Top level comment')).not.toBeInTheDocument();
  });
});
