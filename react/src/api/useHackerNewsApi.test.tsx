import { renderHook, waitFor } from '@testing-library/react'
import * as api from './hackerNewsApi'
import { useFeed, useItem, useUser } from './useHackerNewsApi'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useHackerNewsApi hooks', () => {
  it('useFeed starts loading and resolves data', async () => {
    vi.spyOn(api, 'fetchFeed').mockResolvedValue([])
    const { result } = renderHook(() => useFeed('news', 1))
    expect(result.current.loading).toBe(true)
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data).toEqual([])
    expect(api.fetchFeed).toHaveBeenCalledWith('news', 1, expect.any(AbortSignal))
  })

  it('useItem surfaces errors', async () => {
    vi.spyOn(api, 'fetchItemContent').mockRejectedValue(new Error('boom'))
    const { result } = renderHook(() => useItem(1))
    await waitFor(() => expect(result.current.error?.message).toBe('boom'))
    expect(result.current.data).toBeUndefined()
  })

  it('useUser refetches when the id changes', async () => {
    const spy = vi.spyOn(api, 'fetchUser').mockImplementation(async (id) => ({ id }) as never)
    const { result, rerender } = renderHook(({ id }) => useUser(id), { initialProps: { id: 'a' } })
    await waitFor(() => expect(result.current.data?.id).toBe('a'))
    rerender({ id: 'b' })
    await waitFor(() => expect(result.current.data?.id).toBe('b'))
    expect(spy).toHaveBeenCalledTimes(2)
  })
})
