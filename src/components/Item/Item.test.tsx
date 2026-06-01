import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { SettingsProvider } from '../../context/SettingsContext'
import { Item } from './Item'
import type { Story } from '../../types'

const mockStory: Story = {
    id: 1,
    title: 'Test Story',
    points: 42,
    user: 'testuser',
    time: 1234567890,
    time_ago: '3 hours ago',
    type: 'story',
    url: 'https://example.com',
    domain: 'example.com',
    comments: [],
    comments_count: 5,
    poll: [],
    poll_votes_count: 0,
    deleted: false,
    dead: false,
    content: '',
}

function renderItem(story: Story = mockStory) {
    return render(
        <MemoryRouter>
            <SettingsProvider>
                <Item item={story} />
            </SettingsProvider>
        </MemoryRouter>
    )
}

describe('Item', () => {
    it('renders story title', () => {
        renderItem()
        expect(screen.getAllByText('Test Story').length).toBeGreaterThan(0)
    })

    it('renders story domain', () => {
        renderItem()
        expect(screen.getAllByText(/example\.com/).length).toBeGreaterThan(0)
    })

    it('renders user link', () => {
        renderItem()
        expect(screen.getAllByText('testuser').length).toBeGreaterThan(0)
    })

    it('renders comment count', () => {
        renderItem()
        expect(screen.getAllByText(/5 comments/).length).toBeGreaterThan(0)
    })

    it('hides user and points for job type', () => {
        renderItem({ ...mockStory, type: 'job' })
        expect(screen.queryByText('42 points by')).not.toBeInTheDocument()
    })
})
