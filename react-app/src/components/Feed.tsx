import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFeed } from '../hooks/useHackerNews';
import Item from './Item';
import Loader from './Loader';
import ErrorMessage from './ErrorMessage';

interface FeedProps {
  feedType: string;
}

const Feed: React.FC<FeedProps> = ({ feedType }) => {
  const { page } = useParams<{ page: string }>();
  const pageNum = page ? parseInt(page, 10) : 1;
  const { items, loading, error } = useFeed(feedType, pageNum);
  const listStart = ((pageNum - 1) * 30) + 1;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [feedType, pageNum]);

  if (loading && !items) {
    return (
      <div className="main-content">
        <Loader />
      </div>
    );
  }

  if (error && !items) {
    return (
      <div className="main-content">
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <div className="main-content">
      {items && (
        <div>
          {feedType === 'jobs' && (
            <p className="job-header">
              These are jobs at startups that were funded by Y Combinator. You can
              also get a job at a YC startup through{' '}
              <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
            </p>
          )}
          <ol
            className={feedType !== 'jobs' ? 'list-margin' : ''}
            start={listStart}
          >
            {items.map((item) => (
              <li key={item.id} className="post">
                <Item item={item} />
              </li>
            ))}
          </ol>
          <div className="nav">
            {listStart !== 1 && (
              <Link to={`/${feedType}/${pageNum - 1}`} className="prev">
                &#8249; Prev
              </Link>
            )}
            {items.length === 30 && (
              <Link to={`/${feedType}/${pageNum + 1}`} className="more">
                More &#8250;
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Feed;
