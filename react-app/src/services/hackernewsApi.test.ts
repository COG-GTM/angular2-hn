import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  BASE_URL,
  fetchFeed,
  fetchItemContent,
  fetchJson,
  fetchUser,
} from './hackernewsApi'
import type { Story } from '../types/Story'

function response(data: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    json: vi.fn().mockResolvedValue(data),
  } as unknown as Response
}

describe('hackernewsApi', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  it('builds feed URLs with the selected feed and page', async () => {
    vi.mocked(fetch).mockResolvedValue(response([]))
    await fetchFeed('show', 3)
    expect(fetch).toHaveBeenCalledWith(`${BASE_URL}/show?page=3`, { signal: undefined })
  })

  it('fetches poll options and sums their points', async () => {
    const story = {
      type: 'poll',
      id: 100,
      poll: [{ points: 0, content: '' }, { points: 0, content: '' }],
      poll_votes_count: 0,
    } as Story
    vi.mocked(fetch).mockImplementation(async (input) => {
      const url = String(input)
      if (url.endsWith('/100')) return response(story)
      if (url.endsWith('/101')) return response({ points: 4, content: 'First' })
      return response({ points: 7, content: 'Second' })
    })

    const result = await fetchItemContent(100)
    expect(result.poll).toEqual([
      { points: 4, content: 'First' },
      { points: 7, content: 'Second' },
    ])
    expect(result.poll_votes_count).toBe(11)
    expect(fetch).toHaveBeenCalledWith(`${BASE_URL}/item/101`, { signal: undefined })
    expect(fetch).toHaveBeenCalledWith(`${BASE_URL}/item/102`, { signal: undefined })
  })

  it('keeps the original option when one poll request fails', async () => {
    const story = {
      type: 'poll',
      id: 200,
      poll: [
        { item: 'Original first option', points: 2 },
        { item: 'Original second option', points: 5 },
        { item: 'Original third option', points: 7 },
      ],
      poll_votes_count: 0,
    } as unknown as Story
    vi.mocked(fetch).mockImplementation(async (input) => {
      const url = String(input)
      if (url.endsWith('/200')) return response(story)
      if (url.endsWith('/201')) return response({ points: 3, content: 'Fetched first option' })
      if (url.endsWith('/202')) throw new Error('Option unavailable')
      return response({ points: 11, content: 'Fetched third option' })
    })

    const result = await fetchItemContent(200)

    expect(result.poll).toEqual([
      { points: 3, content: 'Fetched first option' },
      { item: 'Original second option', points: 5, content: 'Original second option' },
      { points: 11, content: 'Fetched third option' },
    ])
    expect(result.poll_votes_count).toBe(19)
  })

  it('rethrows an abort during poll option requests', async () => {
    const story = {
      type: 'poll',
      id: 300,
      poll: [{ item: 'Original option', points: 2 }],
      poll_votes_count: 0,
    } as unknown as Story
    const controller = new AbortController()
    const abortError = new Error('Aborted')
    abortError.name = 'AbortError'
    vi.mocked(fetch).mockImplementation(async (input) => {
      if (String(input).endsWith('/300')) return response(story)
      throw abortError
    })

    const request = fetchItemContent(300, controller.signal)
    controller.abort(abortError)

    await expect(request).rejects.toBe(abortError)
  })

  it('falls back to hnpwa when the node-hnapi user endpoint returns 404', async () => {
    const user = { id: 'alice' }
    vi.mocked(fetch)
      .mockResolvedValueOnce(response(null, false, 404))
      .mockResolvedValueOnce(response(user))

    await expect(fetchUser('alice')).resolves.toEqual(user)
    expect(fetch).toHaveBeenNthCalledWith(1, `${BASE_URL}/user/alice`, { signal: undefined })
    expect(fetch).toHaveBeenNthCalledWith(2, 'https://api.hnpwa.com/v0/user/alice.json', { signal: undefined })
  })

  it('falls back when the node-hnapi user response is not JSON', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockRejectedValue(new SyntaxError('Invalid JSON')),
      } as unknown as Response)
      .mockResolvedValueOnce(response({ id: 'alice' }))

    await expect(fetchUser('alice')).resolves.toEqual({ id: 'alice' })
  })

  it('throws when both user endpoints fail or return null', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(response(null))
      .mockResolvedValueOnce(response(null))

    await expect(fetchUser('missing')).rejects.toThrow('User response was empty')
  })

  it('throws on non-OK responses and invalid JSON', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(response(null, false, 503))
    await expect(fetchJson(`${BASE_URL}/news`)).rejects.toThrow('Request failed: 503')

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: vi.fn().mockRejectedValue(new SyntaxError('Invalid JSON')),
    } as unknown as Response)
    await expect(fetchJson(`${BASE_URL}/news`)).rejects.toThrow('Invalid JSON')
  })

  it('does not fall back after an aborted user request', async () => {
    const controller = new AbortController()
    const abortError = new Error('Aborted')
    abortError.name = 'AbortError'
    vi.mocked(fetch).mockRejectedValueOnce(abortError)

    await expect(fetchUser('alice', controller.signal)).rejects.toBe(abortError)
    expect(fetch).toHaveBeenCalledTimes(1)
  })
})
