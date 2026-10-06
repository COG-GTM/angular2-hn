// Ported from src/app/feeds/feed/feed.component.{ts,html}
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchFeed } from '../../api/hn';
import { ErrorMessage } from '../../components/ErrorMessage';
import { Loader } from '../../components/Loader';
import type { FeedType, Story } from '../../types';
import { listStart } from '../../utils/format';
import { ItemCard } from './ItemCard';
import './FeedPage.scss';

type FeedState = { key: string; items: Story[] | null; error: string };

function parsePage(param: string | undefined): number {
  const page = param ? Math.floor(Number(param)) : 1;
  return Number.isFinite(page) && page > 0 ? page : 1;
}

export function FeedPage({ feedType }: { feedType: FeedType }) {
  const { page: pageParam } = useParams();
  const page = parsePage(pageParam);
  const key = `${feedType}/${page}`;
  const [state, setState] = useState<FeedState>({ key, items: null, error: '' });

  useEffect(() => {
    const controller = new AbortController();
    fetchFeed(feedType, page, controller.signal)
      .then((items) => {
        setState({ key, items, error: '' });
        window.scrollTo(0, 0);
      })
      .catch((err: unknown) => {
        if ((err as Error)?.name === 'AbortError') return;
        setState({ key, items: null, error: `Could not load ${feedType} stories.` });
      });
    return () => controller.abort();
  }, [feedType, page, key]);

  // Ignore results that belong to a previous feed/page so stale items never flash.
  const current = state.key === key ? state : { key, items: null, error: '' };
  const { items, error } = current;
  const start = listStart(page);
  const isJobs = feedType === 'jobs';

  return (
    <div className="main-content feed-page">
      {!items && !error && <Loader />}
      {!items && error && <ErrorMessage message={error} />}

      {items && (
        <div>
          {isJobs && (
            <p className="job-header">
              These are jobs at startups that were funded by Y Combinator. You can also get a job at a YC startup
              through <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
            </p>
          )}
          <ol className={isJobs ? undefined : 'list-margin'} start={start}>
            {items.map((item) => (
              <li key={item.id} className="post">
                <ItemCard item={item} />
              </li>
            ))}
          </ol>
          <div className="nav">
            {start !== 1 && (
              <Link to={`/${feedType}/${page - 1}`} className="prev">
                ‹ Prev
              </Link>
            )}
            {items.length === 30 && (
              <Link to={`/${feedType}/${page + 1}`} className="more">
                More ›
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
