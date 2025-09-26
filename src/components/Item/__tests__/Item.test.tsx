import React from 'react'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import Item from '../Item'
import { SettingsProvider } from '../../../contexts/SettingsContext'
import { Story } from '../../../types'

const mockStory: Story = {
  id: 1,
  title: 'Test Story Title',
  url: 'https://example.com/story',
  domain: 'example.com',
  points: 150,
  user: 'testuser',
  time: 1640995200,
  time_ago: '3 hours ago',
  comments_count: 42,
  type: 'story',
  comments: [],
  poll: [],
  poll_votes_count: 0,
  deleted: false,
  dead: false
}

const renderItemWithProviders = (item: Story) => {
  return render(
    <BrowserRouter>
      <SettingsProvider>
        <Item item={item} />
      </SettingsProvider>
    </BrowserRouter>
  )
}

describe('Item Component', () => {
  it('renders story title and link correctly', () => {
    renderItemWithProviders(mockStory)
    
    const titleLink = screen.getByRole('link', { name: 'Test Story Title' })
    expect(titleLink).toBeInTheDocument()
    expect(titleLink).toHaveAttribute('href', 'https://example.com/story')
  })

  it('displays story metadata correctly', () => {
    renderItemWithProviders(mockStory)
    
    expect(screen.getByText('150 ★')).toBeInTheDocument()
    expect(screen.getAllByText('testuser')).toHaveLength(2) // Mobile and desktop versions
    expect(screen.getAllByText('3 hours ago')).toHaveLength(2) // Mobile and desktop versions
    // Comments appear in both mobile and desktop versions
    const commentLinks = screen.getAllByRole('link', { name: /42 comments/ })
    expect(commentLinks).toHaveLength(2)
  })

  it('renders domain for external links', () => {
    renderItemWithProviders(mockStory)
    expect(screen.getByText('(example.com)')).toBeInTheDocument()
  })

  it('renders comments link correctly', () => {
    renderItemWithProviders(mockStory)
    
    const commentsLink = screen.getByRole('link', { name: '42 comments' })
    expect(commentsLink).toBeInTheDocument()
    expect(commentsLink).toHaveAttribute('href', '/item/1')
  })

  it('handles story without URL (Ask HN, etc.)', () => {
    const askStory: Story = {
      ...mockStory,
      url: '',
      domain: ''
    }
    
    renderItemWithProviders(askStory)
    
    const titleLink = screen.getByRole('link', { name: 'Test Story Title' })
    expect(titleLink).toHaveAttribute('href', '/item/1')
    expect(screen.queryByText('(example.com)')).not.toBeInTheDocument()
  })
})
