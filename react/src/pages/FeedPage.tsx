import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router';
import type { FeedName } from '../api/types';
import { ErrorMessage } from '../components/ErrorMessage';
import { Loader } from '../components/Loader';
import { StoryItem } from '../components/StoryItem';
import { useFeed } from '../hooks/useFeed';
import './FeedPage.css';

export const PAGE_SIZE = 30;

/** `?page=` → positive integer, defaulting to 1. */
export function parsePage(raw: string | null): number {
  const page = Number(raw);
  return Number.isInteger(page) && page >= 1 ? page : 1;
}

export interface FeedPageProps {
  feed: FeedName;
}

/** Port of feeds/feed/feed.component. */
export function FeedPage({ feed }: FeedPageProps) {
  const [searchParams] = useSearchParams();
  const page = parsePage(searchParams.get('page'));
  const state = useFeed(feed, page);

  useEffect(() => {
    if (state.status === 'success') {
      window.scrollTo(0, 0);
    }
  }, [state.status, feed, page]);

  return (
    <div className="main-content">
      {state.status === 'loading' && <Loader />}
      {state.status === 'error' && <ErrorMessage message={`Could not load ${feed} stories.`} />}
      {state.status === 'success' && (
        <div>
          {feed === 'jobs' && (
            <p className="job-header">
              These are jobs at startups that were funded by Y Combinator. You can also get a job at a YC startup
              through <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
            </p>
          )}
          <ol className={feed === 'jobs' ? 'feed-list' : 'feed-list list-margin'} start={(page - 1) * PAGE_SIZE + 1}>
            {state.stories.map((story) => (
              <li key={story.id} className="post">
                <StoryItem story={story} />
              </li>
            ))}
          </ol>
          <nav className="feed-nav" aria-label="Pagination">
            {page !== 1 && (
              <Link to={`/${feed}?page=${page - 1}`} className="prev">
                ‹ Prev
              </Link>
            )}
            {state.stories.length === PAGE_SIZE && (
              <Link to={`/${feed}?page=${page + 1}`} className="more">
                More ›
              </Link>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
