import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

import { fetchFeed } from '../api/hnApi';
import { useFetch } from '../hooks/useFetch';
import Item from './Item';
import Loader from './Loader';
import ErrorMessage from './ErrorMessage';
import './Feed.scss';

interface FeedProps {
  feedType: string;
}

export default function Feed({ feedType }: FeedProps) {
  const { page } = useParams();
  const pageNum = page ? +page : 1;

  const { data: items, error } = useFetch(
    () => fetchFeed(feedType, pageNum),
    [feedType, pageNum],
    `Could not load ${feedType} stories.`
  );

  const listStart = (pageNum - 1) * 30 + 1;

  useEffect(() => {
    if (items) {
      window.scrollTo(0, 0);
    }
  }, [items]);

  return (
    <div className="main-content feed-view">
      {!items && !error && <Loader />}
      {!items && error !== '' && <ErrorMessage message={error} />}

      {items && (
        <div>
          {feedType === 'jobs' && (
            <p className="job-header">
              These are jobs at startups that were funded by Y Combinator. You can also get a job at
              a YC startup through <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
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
            {items.length === 30 && (
              <Link to={`/${feedType}/${pageNum + 1}`} className="more">
                More ›
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
