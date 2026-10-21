import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { fetchFeed } from '../../api/hackernews';
import ErrorMessage from '../../components/shared/ErrorMessage';
import Loader from '../../components/shared/Loader';
import type { FeedType, Story } from '../../models';
import Item from './Item';
import './FeedPage.scss';

export interface FeedPageProps {
  feedType: FeedType;
}

const PAGE_SIZE = 30;

type FeedResult = { page: number } & ({ items: Story[] } | { error: string });

/** Port of src/app/feeds/feed. */
export default function FeedPage({ feedType }: FeedPageProps) {
  const params = useParams<{ page: string }>();
  const page = Number(params.page) || 1;
  const [result, setResult] = useState<FeedResult | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetchFeed(feedType, page, controller.signal).then(
      (items) => {
        if (controller.signal.aborted) return;
        setResult({ page, items });
        window.scrollTo(0, 0);
      },
      () => {
        if (!controller.signal.aborted) {
          setResult({ page, error: `Could not load ${feedType} stories.` });
        }
      }
    );
    return () => controller.abort();
  }, [feedType, page]);

  const current = result?.page === page ? result : null;
  const start = (page - 1) * PAGE_SIZE + 1;

  return (
    <div className="main-content">
      {!current && <Loader />}
      {current && 'error' in current && <ErrorMessage message={current.error} />}
      {current && 'items' in current && (
        <div>
          {feedType === 'jobs' && (
            <p className="job-header">
              These are jobs at startups that were funded by Y Combinator. You can also get a job at a YC startup
              through <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
            </p>
          )}
          <ol className={feedType !== 'jobs' ? 'list-margin' : undefined} start={start}>
            {current.items.map((item) => (
              <li key={item.id} className="post">
                <Item item={item} />
              </li>
            ))}
          </ol>
          <div className="nav">
            {start !== 1 && (
              <Link to={`/${feedType}/${page - 1}`} className="prev">
                ‹ Prev
              </Link>
            )}
            {current.items.length === PAGE_SIZE && (
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
