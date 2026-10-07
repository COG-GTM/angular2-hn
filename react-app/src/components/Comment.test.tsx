import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithAppProviders, makeComment } from '../test/fixtures'
import Comment from './Comment'

describe('Comment', () => {
  it('collapses and expands its content', async () => {
    const user = userEvent.setup()
    renderWithAppProviders(<Comment comment={makeComment()} />)
    const content = screen.getByText('A comment')
    expect(screen.getByText('[-]').nextSibling).toHaveProperty('tagName', 'A')
    expect(content.parentElement).not.toHaveAttribute('hidden')

    await user.click(screen.getByText('[-]'))
    expect(content.parentElement).toHaveAttribute('hidden')

    await user.click(screen.getByText('[+]'))
    expect(content.parentElement).not.toHaveAttribute('hidden')
  })

  it('renders the deleted comment variant', () => {
    renderWithAppProviders(<Comment comment={makeComment({ deleted: true })} />)
    expect(screen.getByText('[deleted]')).toBeInTheDocument()
    expect(screen.getByText('[deleted]').parentElement).toHaveTextContent('Comment Deleted')
    expect(screen.queryByText('A comment')).not.toBeInTheDocument()
  })
})
