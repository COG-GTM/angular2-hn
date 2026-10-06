import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { commentTree } from '../../test/fixtures';
import { renderWithProviders } from '../../test/render';
import type { Comment } from '../../types';
import { CommentTree } from './CommentTree';

const [carol, deleted] = commentTree;

function metaFor(user: string) {
  return screen.getByRole('link', { name: user }).closest('.meta') as HTMLElement;
}

function toggleFor(user: string) {
  return within(metaFor(user)).getByText(/^\[[-+]\]$/);
}

describe('CommentTree', () => {
  it('renders the meta line, comment HTML and nested replies', () => {
    const { container } = renderWithProviders(<CommentTree comment={carol} />);
    const meta = metaFor('carol');
    expect(meta).not.toHaveClass('meta-collapse');
    expect(within(meta).getByText('[-]')).toHaveClass('collapse');
    expect(within(meta).getByRole('link', { name: 'carol' })).toHaveAttribute('href', '/user/carol');
    expect(within(meta).getByText('50 minutes ago')).toHaveClass('time');
    expect(container.querySelector('.comment-text')).toContainHTML('<p>Top level comment</p>');
    const subtree = container.querySelector('ul.subtree')!;
    expect(within(subtree as HTMLElement).getByRole('link', { name: 'dave' })).toHaveAttribute('href', '/user/dave');
    expect(within(subtree as HTMLElement).getByText('Nested reply')).toBeVisible();
  });

  it('collapse toggles [-]/[+] and hides the subtree', async () => {
    renderWithProviders(<CommentTree comment={carol} />);
    await userEvent.click(toggleFor('carol'));
    expect(toggleFor('carol')).toHaveTextContent('[+]');
    expect(metaFor('carol')).toHaveClass('meta', 'meta-collapse');
    expect(screen.getByText('Top level comment')).not.toBeVisible();
    expect(screen.getByText('Nested reply')).not.toBeVisible();
    expect(screen.getByRole('link', { name: 'dave', hidden: true })).not.toBeVisible();

    await userEvent.click(toggleFor('carol'));
    expect(toggleFor('carol')).toHaveTextContent('[-]');
    expect(metaFor('carol')).not.toHaveClass('meta-collapse');
    expect(screen.getByText('Top level comment')).toBeVisible();
    expect(screen.getByText('Nested reply')).toBeVisible();
  });

  it('keeps nested collapse state independent of the parent', async () => {
    const sibling: Comment = { ...carol.comments[0], id: 2010, user: 'frank', content: '<p>Sibling reply</p>' };
    const tree: Comment = { ...carol, comments: [...carol.comments, sibling] };
    renderWithProviders(<CommentTree comment={tree} />);

    await userEvent.click(toggleFor('dave'));
    expect(toggleFor('dave')).toHaveTextContent('[+]');
    expect(toggleFor('carol')).toHaveTextContent('[-]');
    expect(toggleFor('frank')).toHaveTextContent('[-]');
    expect(screen.getByText('Nested reply')).not.toBeVisible();
    expect(screen.getByText('Sibling reply')).toBeVisible();
    expect(screen.getByText('Top level comment')).toBeVisible();

    await userEvent.click(toggleFor('carol'));
    expect(screen.getByText('Sibling reply')).not.toBeVisible();
    await userEvent.click(toggleFor('carol'));

    expect(toggleFor('dave')).toHaveTextContent('[+]');
    expect(toggleFor('frank')).toHaveTextContent('[-]');
    expect(screen.getByRole('link', { name: 'dave' })).toBeVisible();
    expect(screen.getByText('Nested reply')).not.toBeVisible();
    expect(screen.getByText('Sibling reply')).toBeVisible();
  });

  it('renders deleted comments without meta or replies', () => {
    const { container } = renderWithProviders(<CommentTree comment={deleted} />);
    const meta = container.querySelector('.deleted-meta');
    expect(meta).toHaveTextContent('[deleted] | Comment Deleted');
    expect(meta?.querySelector('.collapse')).toHaveTextContent('[deleted]');
    expect(container.querySelector('.meta')).toBeNull();
    expect(container.querySelector('.comment-tree')).toBeNull();
  });
});
