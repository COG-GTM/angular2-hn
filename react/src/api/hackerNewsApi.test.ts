import { fetchFeed, fetchItemContent, fetchUser, HN_API_BASE_URL } from './hackerNewsApi'

function mockFetch(responses: Record<string, unknown>) {
  const fetchMock = vi.fn(async (url: string) => {
    const path = url.replace(HN_API_BASE_URL, '')
    if (!(path in responses)) {
      return new Response('not found', { status: 404 })
    }
    return new Response(JSON.stringify(responses[path]), { status: 200 })
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('hackerNewsApi', () => {
  it('fetches a feed page from the same endpoint as HackerNewsAPIService.fetchFeed', async () => {
    const fetchMock = mockFetch({ '/newest?page=2': [{ id: 1 }] })
    await expect(fetchFeed('newest', 2)).resolves.toEqual([{ id: 1 }])
    expect(fetchMock).toHaveBeenCalledWith(`${HN_API_BASE_URL}/newest?page=2`, expect.anything())
  })

  it('fetches a user from /user/:id', async () => {
    mockFetch({ '/user/pg': { id: 'pg', karma: 1 } })
    await expect(fetchUser('pg')).resolves.toMatchObject({ id: 'pg', karma: 1 })
  })

  it('returns non-poll items untouched', async () => {
    const fetchMock = mockFetch({ '/item/7': { id: 7, type: 'story', comments: [] } })
    await expect(fetchItemContent(7)).resolves.toEqual({ id: 7, type: 'story', comments: [] })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('resolves poll options from consecutive item ids and totals their votes', async () => {
    mockFetch({
      '/item/100': { id: 100, type: 'poll', poll: [{}, {}], comments: [] },
      '/item/101': { content: 'Yes', points: 3 },
      '/item/102': { content: 'No', points: 5 },
    })
    const story = await fetchItemContent(100)
    expect(story.poll).toEqual([
      { content: 'Yes', points: 3 },
      { content: 'No', points: 5 },
    ])
    expect(story.poll_votes_count).toBe(8)
  })

  it('rejects on non-2xx responses', async () => {
    mockFetch({})
    await expect(fetchUser('missing')).rejects.toThrow('404')
  })
})
