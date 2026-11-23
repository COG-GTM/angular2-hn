import { useEffect } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { fetchFeed } from '../../api/hn';
import type { FeedType } from '../../api/types';
import { useAsync } from '../../api/useAsync';
import { ErrorMessage } from '../../shared/ErrorMessage/ErrorMessage';
import { Loader } from '../../shared/Loader/Loader';
import { Item } from './Item';
import './Feed.scss';

const PAGE_SIZE = 30;

/** Port of the Angular `app-feed` component, routed at /:feed/:page. */
export function Feed({ feedType }: { feedType: FeedType }) {
  const { page } = useParams();
  const pageNum = page ? +page : 1;
  const { data: items, error } = useAsync((signal) => fetchFeed(feedType, pageNum, signal), [feedType, pageNum]);
  const listStart = (pageNum - 1) * PAGE_SIZE + 1;

  useEffect(() => {
    if (items) window.scrollTo(0, 0);
  }, [items]);

  return (
    <div className="hn-feed">
      <div className="main-content">
        {!items && !error && <Loader />}
        {!items && error && <ErrorMessage message={`Could not load ${feedType} stories.`} />}

        {items && (
          <div>
            {feedType === 'jobs' && (
              <p className="job-header">
                {' '}These are jobs at startups that were funded by Y Combinator.
                You can also get a job at a YC startup through <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.{' '}
              </p>
            )}
            <ol className={feedType !== 'jobs' ? 'list-margin' : undefined} start={listStart}>
              {items.map((item) => (
                <li key={item.id} className="post">
                  <Item className="item-block" item={item} />
                </li>
              ))}
            </ol>
            <div className="nav">
              {listStart !== 1 && (
                <NavLink to={`/${feedType}/${pageNum - 1}`} className="prev">
                  {' '}‹ Prev{' '}
                </NavLink>
              )}
              {items.length === PAGE_SIZE && (
                <NavLink to={`/${feedType}/${pageNum + 1}`} className="more">
                  {' '}More ›{' '}
                </NavLink>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
