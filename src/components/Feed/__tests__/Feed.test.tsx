import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Feed from '../Feed'
import { FeedType, Story } from '../../../types'
import { SettingsProvider } from '../../../contexts/SettingsContext'

vi.mock('../../../hooks/useHackerNewsAPI', () => ({
  useFeed: vi.fn()
}))

import { useFeed } from '../../../hooks/useHackerNewsAPI'

const mockUseFeed = useFeed as any

const renderFeedWithRouter = (items: Story[], feedType: FeedType, pageNum: number) => {
  return render(
    <BrowserRouter>
      <SettingsProvider>
        <Feed items={items} feedType={feedType} pageNum={pageNum} />
      </SettingsProvider>
    </BrowserRouter>
  )
}

describe('Feed Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders feed items correctly', () => {
    const mockItems: Story[] = [{
      id: 1,
      title: 'Test Story',
      url: 'https://example.com',
      domain: 'example.com',
      points: 100,
      user: 'testuser',
      time: 1640995200,
      time_ago: '2 hours ago',
      comments_count: 25,
      type: 'story',
      comments: [],
      poll: [],
      poll_votes_count: 0,
      deleted: false,
      dead: false
    }]

    renderFeedWithRouter(mockItems, 'news' as FeedType, 1)
    expect(screen.getByText('Test Story')).toBeInTheDocument()
  })

  it('renders empty feed', () => {
    renderFeedWithRouter([], 'news' as FeedType, 1)
    expect(screen.queryByText('Test Story')).not.toBeInTheDocument()
  })

  it('renders navigation links correctly', () => {
    const mockItems: Story[] = Array.from({ length: 30 }, (_, i) => ({
      id: i + 1,
      title: `Story ${i + 1}`,
      url: `https://example${i}.com`,
      domain: `example${i}.com`,
      points: 50 + i,
      user: `user${i}`,
      time: 1640995200 + i,
      time_ago: `${i + 1} hours ago`,
      comments_count: i * 2,
      type: 'story' as FeedType,
      comments: [],
      poll: [],
      poll_votes_count: 0,
      deleted: false,
      dead: false
    }))

    renderFeedWithRouter(mockItems, 'news' as FeedType, 2)
    
    expect(screen.getByText('‹ Prev')).toBeInTheDocument()
    expect(screen.getByText('More ›')).toBeInTheDocument()
  })
})
