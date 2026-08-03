import { useCallback, useEffect } from 'react';
import { NavLink, useParams } from 'react-router-dom';

import { ErrorMessage } from '../../shared/components/error-message/ErrorMessage';
import { Loader } from '../../shared/components/loader/Loader';
import { useAsyncData } from '../../shared/hooks/useAsyncData';
import { fetchFeed } from '../../shared/services/hackernewsApi';
import { Item } from '../item/Item';
import './Feed.scss';

const PAGE_SIZE = 30;

export function Feed({ feedType }: { feedType: string }) {
  const { page } = useParams();
  const pageNum = page ? Number(page) : 1;
  const listStart = (pageNum - 1) * PAGE_SIZE + 1;

  const load = useCallback((signal: AbortSignal) => fetchFeed(feedType, pageNum, signal), [feedType, pageNum]);
  const feed = useAsyncData(`${feedType}/${pageNum}`, load);

  useEffect(() => {
    if (feed.status === 'success') {
      window.scrollTo(0, 0);
    }
  }, [feed]);

  return (
    <div className="feed-view main-content">
      {feed.status === 'loading' && <Loader />}
      {feed.status === 'error' && <ErrorMessage message={`Could not load ${feedType} stories.`} />}

      {feed.status === 'success' && (
        <div>
          {feedType === 'jobs' && (
            <p className="job-header">
              These are jobs at startups that were funded by Y Combinator. You can also get a job at a YC startup
              through <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
            </p>
          )}
          <ol className={feedType !== 'jobs' ? 'list-margin' : undefined} start={listStart}>
            {feed.data.map((item) => (
              <li key={item.id} className="post">
                <Item item={item} />
              </li>
            ))}
          </ol>
          <div className="nav">
            {listStart !== 1 && (
              <NavLink
                className={({ isActive }) => `prev${isActive ? ' active' : ''}`}
                to={`/${feedType}/${pageNum - 1}`}
              >
                ‹ Prev
              </NavLink>
            )}
            {feed.data.length === PAGE_SIZE && (
              <NavLink
                className={({ isActive }) => `more${isActive ? ' active' : ''}`}
                to={`/${feedType}/${pageNum + 1}`}
              >
                More ›
              </NavLink>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
