import { useEffect, useState } from 'react';
import { fetchFeed } from '../api/hn';
import type { FeedName, Story } from '../api/types';

export type FeedState =
  | { status: 'loading' }
  | { status: 'error'; error: unknown }
  | { status: 'success'; stories: Story[] };

interface Result {
  key: string;
  state: FeedState;
}

/** Loads one feed page; aborts the in-flight request when `feed`/`page` change or on unmount. */
export function useFeed(feed: FeedName, page: number): FeedState {
  const key = `${feed}:${page}`;
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetchFeed(feed, page, { signal: controller.signal }).then(
      (stories) => setResult({ key, state: { status: 'success', stories } }),
      (error: unknown) => {
        if (!controller.signal.aborted) {
          setResult({ key, state: { status: 'error', error } });
        }
      },
    );
    return () => controller.abort();
  }, [feed, page, key]);

  return result?.key === key ? result.state : { status: 'loading' };
}
