import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFeed } from '../hooks/useHackerNewsAPI';
import Item from './Item';
import Loader from './Loader';
import ErrorMessage from './ErrorMessage';
import '../styles/Feed.scss';

interface FeedProps {
  feedType: string;
}

export const Feed: React.FC<FeedProps> = ({ feedType }) => {
  const { page } = useParams<{ page: string }>();
  const pageNum = parseInt(page || '1', 10);
  const { items, loading, error } = useFeed(feedType, pageNum);
  const listStart = (pageNum - 1) * 30 + 1;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pageNum, feedType]);

  if (loading) {
    return (
      <div className="main-content">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="main-content">
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <div className="main-content">
      {feedType === 'jobs' && (
        <p className="job-header">
          These are jobs at startups that were funded by Y Combinator. You can also get a
          job at a YC startup through{' '}
          <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
        </p>
      )}
      {feedType !== 'new' && (
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
      )}
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
  );
};

export default Feed;
