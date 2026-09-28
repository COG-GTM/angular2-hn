import { useEffect, useState } from 'react'
import { fetchFeed, fetchItemContent, fetchUser } from './hackerNewsApi'
import type { FeedType, Story, User } from './types'

export interface AsyncState<T> {
  data: T | undefined
  loading: boolean
  error: Error | undefined
}

function useAsync<T>(load: (signal: AbortSignal) => Promise<T>, deps: readonly unknown[]): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({ data: undefined, loading: true, error: undefined })

  useEffect(() => {
    const controller = new AbortController()
    setState({ data: undefined, loading: true, error: undefined })
    load(controller.signal).then(
      (data) => {
        if (!controller.signal.aborted) setState({ data, loading: false, error: undefined })
      },
      (error: unknown) => {
        if (!controller.signal.aborted) {
          setState({ data: undefined, loading: false, error: error instanceof Error ? error : new Error(String(error)) })
        }
      },
    )
    return () => controller.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return state
}

export function useFeed(feedType: FeedType, page: number): AsyncState<Story[]> {
  return useAsync((signal) => fetchFeed(feedType, page, signal), [feedType, page])
}

export function useItem(id: number): AsyncState<Story> {
  return useAsync((signal) => fetchItemContent(id, signal), [id])
}

export function useUser(id: string): AsyncState<User> {
  return useAsync((signal) => fetchUser(id, signal), [id])
}
