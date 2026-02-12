// Feed component — displays a paginated list of Hacker News stories.
// Accepts a feedType prop (e.g. 'news', 'newest', 'show', 'ask', 'jobs')
// and reads the current page from the URL via React Router.
// Migrated from Angular's FeedComponent (src/app/feeds/feed/feed.component.ts).
import { useParams } from 'react-router-dom';
import { useEffect, useReducer } from 'react';
import { Item } from './Item';
import { fetchFeed } from '../../services/hackernews-api';
import type { Story } from '../../models/story';

interface FeedProps {
  feedType: string;
}

interface FeedState {
  stories: Story[];
  loading: boolean;
  error: string | null;
}

type FeedAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; stories: Story[] }
  | { type: 'FETCH_ERROR'; error: string };

function feedReducer(_state: FeedState, action: FeedAction): FeedState {
  switch (action.type) {
    case 'FETCH_START':
      return { stories: [], loading: true, error: null };
    case 'FETCH_SUCCESS':
      return { stories: action.stories, loading: false, error: null };
    case 'FETCH_ERROR':
      return { stories: [], loading: false, error: action.error };
  }
}

export function Feed({ feedType }: FeedProps) {
  const { page } = useParams<{ page: string }>();
  const [state, dispatch] = useReducer(feedReducer, { stories: [], loading: true, error: null });

  useEffect(() => {
    let cancelled = false;
    dispatch({ type: 'FETCH_START' });

    fetchFeed(feedType, Number(page) || 1)
      .then(data => {
        if (!cancelled) dispatch({ type: 'FETCH_SUCCESS', stories: data });
      })
      .catch(err => {
        if (!cancelled) dispatch({ type: 'FETCH_ERROR', error: err instanceof Error ? err.message : 'Failed to load feed' });
      });

    return () => { cancelled = true; };
  }, [feedType, page]);

  if (state.loading) return <p>Loading...</p>;
  if (state.error) return <p>Error: {state.error}</p>;

  return (
    <div>
      {state.stories.map(story => (
        <Item key={story.id} item={story} />
      ))}
    </div>
  );
}
