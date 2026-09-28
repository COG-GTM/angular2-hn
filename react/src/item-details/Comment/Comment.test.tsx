// CHAR-33 parity test for src/app/item-details/comment/comment.component.{ts,html}: per-node collapse
// (starts expanded, "[-]"/"[+]" toggle hides content and replies), /user/:user link, time_ago, innerHTML
// content, deleted-comment rendering and recursive rendering of comment.comments.
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import type { Comment as HNComment } from '../../api'
import { renderWithProviders } from '../../test/renderWithProviders'
import { Comment } from './Comment'

function makeComment(overrides: Partial<HNComment> & Pick<HNComment, 'id' | 'user'>): HNComment {
  return {
    level: 0,
    time: 1_600_000_000,
    time_ago: '2 hours ago',
    content: `<p>content by ${overrides.user}</p>`,
    comments: [],
    ...overrides,
  }
}

const thread = makeComment({
  id: 1,
  user: 'root',
  time_ago: '3 hours ago',
  content: 'Root <i>comment</i> with <a href="https://example.com">a link</a>',
  comments: [
    makeComment({
      id: 2,
      user: 'childA',
      level: 1,
      comments: [makeComment({ id: 3, user: 'grandchild', level: 2 })],
    }),
    makeComment({ id: 4, user: 'childB', level: 1 }),
  ],
})

function toggleFor(user: string) {
  const meta = screen.getByRole('link', { name: user }).closest('.meta') as HTMLElement
  return within(meta).getByText(/^\[[-+]\]$/)
}

describe('Comment', () => {
  it('renders the meta row, HTML content and nested replies recursively', () => {
    const { container } = renderWithProviders(<Comment comment={thread} />)

    expect(container.querySelectorAll('.app-comment')).toHaveLength(4)
    expect(container.querySelectorAll('.meta')).toHaveLength(4)
    expect(screen.getByText('3 hours ago')).toHaveClass('time')

    const rootText = container.querySelector('.comment-text') as HTMLElement
    expect(rootText.innerHTML).toBe('Root <i>comment</i> with <a href="https://example.com">a link</a>')

    const rootSubtree = container.querySelector('.subtree') as HTMLElement
    expect(rootSubtree.children).toHaveLength(2)
    expect(within(rootSubtree).getByRole('link', { name: 'grandchild' })).toBeInTheDocument()
    for (const user of ['root', 'childA', 'grandchild', 'childB']) {
      expect(toggleFor(user)).toHaveTextContent('[-]')
    }
    for (const user of ['childA', 'grandchild', 'childB']) {
      expect(screen.getByText(`content by ${user}`)).toBeVisible()
    }
  })

  it('links the user to /user/:user', () => {
    renderWithProviders(<Comment comment={thread} />)

    expect(screen.getByRole('link', { name: 'root' })).toHaveAttribute('href', '/user/root')
    expect(screen.getByRole('link', { name: 'grandchild' })).toHaveAttribute('href', '/user/grandchild')
  })

  it('collapsing a parent hides its content and subtree but not its siblings', async () => {
    const user = userEvent.setup()
    const { container } = renderWithProviders(<Comment comment={thread} />)

    await user.click(toggleFor('childA'))

    expect(toggleFor('childA')).toHaveTextContent('[+]')
    const childAMeta = screen.getByRole('link', { name: 'childA' }).closest('.meta')
    expect(childAMeta).toHaveClass('meta', 'meta-collapse')
    expect(screen.getByText('content by childA')).not.toBeVisible()
    expect(screen.getByText('content by grandchild')).not.toBeVisible()
    expect(screen.getByRole('link', { name: 'grandchild', hidden: true })).not.toBeVisible()

    expect(screen.getByRole('link', { name: 'childA' })).toBeVisible()
    expect(screen.getByText('content by childB')).toBeVisible()
    expect(screen.getByText('Root', { exact: false, selector: 'p' })).toBeVisible()
    expect(container.querySelectorAll('.meta-collapse')).toHaveLength(1)

    await user.click(toggleFor('childA'))

    expect(toggleFor('childA')).toHaveTextContent('[-]')
    expect(childAMeta).not.toHaveClass('meta-collapse')
    expect(screen.getByText('content by grandchild')).toBeVisible()
  })

  it('keeps collapse state per node', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Comment comment={thread} />)

    await user.click(toggleFor('grandchild'))
    await user.click(toggleFor('childB'))

    expect(toggleFor('grandchild')).toHaveTextContent('[+]')
    expect(toggleFor('childB')).toHaveTextContent('[+]')
    expect(toggleFor('childA')).toHaveTextContent('[-]')
    expect(toggleFor('root')).toHaveTextContent('[-]')
    expect(screen.getByText('content by grandchild')).not.toBeVisible()
    expect(screen.getByText('content by childB')).not.toBeVisible()
    expect(screen.getByText('content by childA')).toBeVisible()

    await user.click(toggleFor('root'))
    await user.click(toggleFor('root'))

    expect(toggleFor('grandchild')).toHaveTextContent('[+]')
    expect(screen.getByText('content by grandchild')).not.toBeVisible()
    expect(screen.getByText('content by childA')).toBeVisible()
  })

  it('renders a deleted comment without meta, content or replies', () => {
    const deleted = makeComment({
      id: 5,
      user: 'gone',
      deleted: true,
      comments: [makeComment({ id: 6, user: 'orphan', level: 1 })],
    })
    const { container } = renderWithProviders(<Comment comment={deleted} />)

    const deletedMeta = container.querySelector('.deleted-meta') as HTMLElement
    expect(deletedMeta).toHaveTextContent(/^\[deleted\] \| Comment Deleted$/)
    expect(within(deletedMeta).getByText('[deleted]')).toHaveClass('collapse')
    expect(container.querySelector('.meta')).toBeNull()
    expect(container.querySelector('.comment-text')).toBeNull()
    expect(screen.queryByRole('link')).toBeNull()
    expect(screen.queryByText('content by orphan')).toBeNull()
  })

  it('renders a deleted reply inside a live parent', () => {
    const parent = makeComment({
      id: 7,
      user: 'alive',
      comments: [makeComment({ id: 8, user: 'gone', deleted: true })],
    })
    const { container } = renderWithProviders(<Comment comment={parent} />)

    expect(screen.getByRole('link', { name: 'alive' })).toBeInTheDocument()
    expect(within(container.querySelector('.subtree') as HTMLElement).getByText('[deleted]')).toBeVisible()
  })
})
