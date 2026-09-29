import { useCallback, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

import { ErrorMessage } from '../../shared/components/error-message/ErrorMessage';
import { Loader } from '../../shared/components/loader/Loader';
import { useAsync } from '../../shared/hooks/useAsync';
import type { Feed as FeedName } from '../../shared/models/feed-type';
import { fetchFeed } from '../../shared/services/hackernewsApi';
import { Item } from '../item/Item';
import './Feed.scss';

export const PAGE_SIZE = 30;

export function Feed({ feedType }: { feedType: FeedName }) {
  const { page } = useParams();
  const pageNum = Number(page) || 1;
  const listStart = (pageNum - 1) * PAGE_SIZE + 1;

  const loadFeed = useCallback((signal: AbortSignal) => fetchFeed(feedType, pageNum, signal), [feedType, pageNum]);
  const { data: items, error } = useAsync(loadFeed);

  useEffect(() => {
    if (items) window.scrollTo(0, 0);
  }, [items]);

  return (
    <div className="feed-component">
      <div className="main-content">
        {!items && !error && <Loader />}
        {!items && !!error && <ErrorMessage message={`Could not load ${feedType} stories.`} />}

        {items && (
          <div>
            {feedType === 'jobs' && (
              <p className="job-header">
                These are jobs at startups that were funded by Y Combinator. You can also get a job at a YC startup
                through <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
              </p>
            )}
            <ol className={feedType !== 'jobs' ? 'list-margin' : undefined} start={listStart}>
              {items.map((item) => (
                <li key={item.id} className="post">
                  <Item item={item} />
                </li>
              ))}
            </ol>
            <div className="nav">
              {listStart !== 1 && (
                <Link to={`/${feedType}/${pageNum - 1}`} className="prev">
                  ‹ Prev
                </Link>
              )}
              {items.length === PAGE_SIZE && (
                <Link to={`/${feedType}/${pageNum + 1}`} className="more">
                  More ›
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
