import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import type { Comment } from '../api/types';
import { CommentTree } from './CommentTree';

function comment(id: number, level: number, comments: Comment[] = [], extra: Partial<Comment> = {}): Comment {
  return {
    id,
    level,
    user: `user${id}`,
    time: 1790000000,
    time_ago: `${id} minutes ago`,
    content: `<p>Comment ${id}</p>`,
    comments,
    ...extra,
  };
}

/** A single chain `depth` levels deep: 1 → 2 → … → depth. */
function chain(depth: number, level = 0): Comment {
  const id = level + 1;
  return comment(id, level, id < depth ? [chain(depth, level + 1)] : []);
}

function renderTree(root: Comment) {
  return render(
    <MemoryRouter>
      <CommentTree comment={root} />
    </MemoryRouter>,
  );
}

describe('CommentTree', () => {
  it('renders user link, age and HTML content', () => {
    renderTree(comment(1, 0, [], { content: '<p>Hello <i>world</i></p>' }));
    expect(screen.getByRole('link', { name: 'user1' })).toHaveAttribute('href', '/user/user1');
    expect(screen.getByText('1 minutes ago')).toBeInTheDocument();
    expect(screen.getByText('world').tagName).toBe('I');
  });

  it.each([1, 5, 40])('renders a %i-level-deep reply chain', (depth) => {
    const { container } = renderTree(chain(depth));
    const nodes = container.querySelectorAll('.comment');
    expect(nodes).toHaveLength(depth);
    expect(nodes[depth - 1]).toHaveAttribute('data-level', String(depth - 1));
    expect(screen.getByText(`Comment ${depth}`)).toBeInTheDocument();
    for (let i = 1; i < depth; i++) {
      expect(nodes[i - 1].contains(nodes[i])).toBe(true);
    }
  });

  it('renders siblings and mixed branching', () => {
    const tree = comment(1, 0, [comment(2, 1, [comment(4, 2), comment(5, 2)]), comment(3, 1, [comment(6, 2, [comment(7, 3)])])]);
    const { container } = renderTree(tree);
    expect(container.querySelectorAll('.comment')).toHaveLength(7);
    const first = container.querySelector('[data-level="1"]') as HTMLElement;
    expect(within(first).getByText('Comment 4')).toBeInTheDocument();
    expect(within(first).getByText('Comment 5')).toBeInTheDocument();
    expect(within(first).queryByText('Comment 7')).not.toBeInTheDocument();
  });

  it('collapses and expands a subtree', async () => {
    const user = userEvent.setup();
    renderTree(chain(3));
    const [toggle] = screen.getAllByRole('button', { name: 'Collapse comment' });
    expect(toggle).toHaveTextContent('[-]');

    await user.click(toggle);
    expect(toggle).toHaveTextContent('[+]');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByText('Comment 1')).not.toBeVisible();
    expect(screen.getByText('Comment 3')).not.toBeVisible();
    expect(screen.getByRole('link', { name: 'user1' })).toBeVisible();

    await user.click(toggle);
    expect(screen.getByText('Comment 3')).toBeVisible();
  });

  it('renders deleted comments as a placeholder without children', () => {
    renderTree(comment(1, 0, [comment(2, 1)], { deleted: true, user: null, content: '' }));
    expect(screen.getByText('[deleted]')).toBeInTheDocument();
    expect(screen.getByText(/Comment Deleted/)).toBeInTheDocument();
    expect(screen.queryByText('Comment 2')).not.toBeInTheDocument();
  });
});
