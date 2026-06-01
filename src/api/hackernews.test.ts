import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchFeed, fetchItemContent, fetchUser } from './hackernews'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

beforeEach(() => {
    mockFetch.mockReset()
})

describe('fetchFeed', () => {
    it('fetches feed data for given type and page', async () => {
        const mockStories = [{ id: 1, title: 'Test' }]
        mockFetch.mockResolvedValueOnce({ json: () => Promise.resolve(mockStories) })

        const result = await fetchFeed('news', 1)
        expect(mockFetch).toHaveBeenCalledWith('https://node-hnapi.herokuapp.com/news?page=1')
        expect(result).toEqual(mockStories)
    })
})

describe('fetchItemContent', () => {
    it('fetches story without poll', async () => {
        const mockStory = { id: 1, title: 'Test', type: 'story' }
        mockFetch.mockResolvedValueOnce({ json: () => Promise.resolve(mockStory) })

        const result = await fetchItemContent(1)
        expect(mockFetch).toHaveBeenCalledWith('https://node-hnapi.herokuapp.com/item/1')
        expect(result).toEqual(mockStory)
    })

    it('fetches story with poll and resolves poll content', async () => {
        const mockStory = { id: 100, title: 'Poll', type: 'poll', poll: [{}, {}] }
        const poll1 = { points: 10, content: 'Option 1' }
        const poll2 = { points: 20, content: 'Option 2' }
        mockFetch
            .mockResolvedValueOnce({ json: () => Promise.resolve(mockStory) })
            .mockResolvedValueOnce({ json: () => Promise.resolve(poll1) })
            .mockResolvedValueOnce({ json: () => Promise.resolve(poll2) })

        const result = await fetchItemContent(100)
        expect(result.poll).toEqual([poll1, poll2])
        expect(result.poll_votes_count).toBe(30)
    })
})

describe('fetchUser', () => {
    it('fetches user data', async () => {
        const mockUser = { id: 'test', karma: 100 }
        mockFetch.mockResolvedValueOnce({ json: () => Promise.resolve(mockUser) })

        const result = await fetchUser('test')
        expect(mockFetch).toHaveBeenCalledWith('https://node-hnapi.herokuapp.com/user/test')
        expect(result).toEqual(mockUser)
    })
})
