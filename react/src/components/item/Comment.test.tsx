import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import type { Comment as CommentModel } from '../../api/types';
import { Comment } from './Comment';

function makeComment(id: number, level: number, comments: CommentModel[] = [], extra: Partial<CommentModel> = {}): CommentModel {
  return {
    id,
    level,
    user: `user${id}`,
    time: 0,
    time_ago: `${id} hours ago`,
    content: `<p>text ${id}</p>`,
    comments,
    ...extra,
  };
}

// user1 > user2 > user3 > user4, plus a sibling user5 under user1.
const tree = makeComment(1, 0, [makeComment(2, 1, [makeComment(3, 2, [makeComment(4, 3)])]), makeComment(5, 1)]);

function renderComment(comment: CommentModel) {
  return render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Comment comment={comment} />
    </MemoryRouter>,
  );
}

function metaOf(user: string): HTMLElement {
  return screen.getByRole('link', { name: user, hidden: true }).closest('.meta') as HTMLElement;
}

describe('Comment', () => {
  afterEach(cleanup);

  it('renders meta, text and the Angular DOM structure', () => {
    const { container } = renderComment(makeComment(7, 0));
    const host = container.firstElementChild as HTMLElement;
    expect(host).toHaveClass('app-comment');
    const meta = host.querySelector('.meta') as HTMLElement;
    expect(meta).not.toHaveClass('meta-collapse');
    expect(meta.querySelector('span.collapse')).toHaveTextContent('[-]');
    expect(meta.querySelector('a')).toHaveAttribute('href', '/user/user7');
    expect(meta.querySelector('span.time')).toHaveTextContent('7 hours ago');
    expect(meta.textContent).toBe('[-]user77 hours ago');
    const text = host.querySelector('.comment-tree > div > p.comment-text') as HTMLElement;
    expect(text.innerHTML).toBe('<p>text 7</p>');
    expect(host.querySelector('.comment-tree > div > ul.subtree')).toBeEmptyDOMElement();
  });

  it('renders nested replies recursively at every depth', () => {
    const { container } = renderComment(tree);
    expect(container.querySelectorAll('.app-comment')).toHaveLength(5);
    const deepest = screen.getByRole('link', { name: 'user4' }).closest('.app-comment') as HTMLElement;
    let depth = 0;
    for (let el = deepest.parentElement; el; el = el.parentElement) {
      if (el.matches('ul.subtree > li')) depth++;
    }
    expect(depth).toBe(3);
    expect(deepest.querySelector('.comment-text')?.innerHTML).toBe('<p>text 4</p>');
    const siblings = container.querySelectorAll(':scope > .app-comment > div > .comment-tree > div > ul.subtree > li');
    expect(siblings).toHaveLength(2);
  });

  it('collapses and expands the whole subtree', () => {
    const { container } = renderComment(tree);
    const toggle = metaOf('user1').querySelector('span.collapse') as HTMLElement;
    const body = container.querySelector('.comment-tree > div') as HTMLElement;

    fireEvent.click(toggle);
    expect(toggle).toHaveTextContent('[+]');
    expect(metaOf('user1')).toHaveClass('meta', 'meta-collapse');
    expect(body).toHaveAttribute('hidden');
    expect(body).toContainElement(screen.getByRole('link', { name: 'user4', hidden: true }));

    fireEvent.click(toggle);
    expect(toggle).toHaveTextContent('[-]');
    expect(metaOf('user1')).not.toHaveClass('meta-collapse');
    expect(body).not.toHaveAttribute('hidden');
  });

  it('keeps collapse state per comment', () => {
    renderComment(tree);
    fireEvent.click(metaOf('user2').querySelector('span.collapse') as HTMLElement);
    expect(metaOf('user2')).toHaveClass('meta-collapse');
    expect(metaOf('user1')).not.toHaveClass('meta-collapse');
    expect(metaOf('user5')).not.toHaveClass('meta-collapse');
    expect(metaOf('user3')).not.toHaveClass('meta-collapse');
    expect(screen.getByRole('link', { name: 'user5' })).toBeVisible();
    expect(screen.queryByRole('link', { name: 'user3' })).toBeNull();
  });

  it('renders deleted comments without text or replies', () => {
    const deleted = makeComment(9, 1, [makeComment(10, 2)], { deleted: true });
    const { container } = renderComment(makeComment(8, 0, [deleted]));
    const deletedMeta = container.querySelector('.deleted-meta') as HTMLElement;
    expect(deletedMeta.innerHTML).toBe('<span class="collapse">[deleted]</span> | Comment Deleted ');
    const deletedHost = deletedMeta.closest('.app-comment') as HTMLElement;
    expect(deletedHost.querySelector('.meta, .comment-text, .subtree')).toBeNull();
    expect(screen.queryByText('user10')).toBeNull();
  });
});
