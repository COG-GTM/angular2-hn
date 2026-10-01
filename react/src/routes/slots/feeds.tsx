/*
 * ROUTE SLOT — owned by T3 (Feeds).
 * The route table (routes/routes.tsx) renders `<FeedSlot feed=… />` for every
 * feed path. T3 replaces the placeholder below with the real feed page; keep
 * the `FeedSlot` export name and props.
 */
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { fetchFeed } from '../../api/hn';
import type { FeedName, Story } from '../../api/types';
import { ErrorMessage } from '../../components/ErrorMessage';
import { Loader } from '../../components/Loader';

export interface FeedSlotProps {
  feed: FeedName;
}

export function FeedSlot({ feed }: FeedSlotProps) {
  const [searchParams] = useSearchParams();
  const page = Number(searchParams.get('page')) || 1;
  const [state, setState] = useState<{ key: string; stories?: Story[]; error?: boolean }>({ key: '' });
  const key = `${feed}:${page}`;

  useEffect(() => {
    const controller = new AbortController();
    fetchFeed(feed, page, { signal: controller.signal }).then(
      (stories) => setState({ key, stories }),
      (err: unknown) => {
        if (!controller.signal.aborted) {
          console.error(err);
          setState({ key, error: true });
        }
      },
    );
    return () => controller.abort();
  }, [feed, page, key]);

  if (state.key !== key) return <Loader />;
  if (state.error) return <ErrorMessage message="Could not load stories." />;
  return (
    <ol>
      {state.stories?.map((story) => (
        <li key={story.id}>{story.title}</li>
      ))}
    </ol>
  );
}
