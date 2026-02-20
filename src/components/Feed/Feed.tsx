import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useFeed } from '../../hooks/useHackerNewsApi';
import Loader from '../Loader/Loader';
import ErrorMessage from '../ErrorMessage/ErrorMessage';
import FeedItem from '../FeedItem/FeedItem';
import './Feed.scss';

interface FeedProps {
  feedType: string;
}

function Feed({ feedType }: FeedProps) {
  const { page } = useParams<{ page: string }>();
  const pageNum = page ? parseInt(page, 10) : 1;
  const { items, error } = useFeed(feedType, pageNum);
  const listStart = (pageNum - 1) * 30 + 1;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [feedType, pageNum]);

  return (
    <div className="main-content">
      {!items && !error && <Loader />}
      {!items && error && <ErrorMessage message={error} />}

      {items && (
        <div>
          {feedType === 'jobs' && (
            <p className="job-header">
              These are jobs at startups that were funded by Y Combinator.
              You can also get a job at a YC startup through{' '}
              <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
            </p>
          )}
          {feedType !== 'new' && (
            <ol className={feedType !== 'jobs' ? 'list-margin' : undefined} start={listStart}>
              {items.map(item => (
                <li key={item.id} className="post">
                  <FeedItem item={item} />
                </li>
              ))}
            </ol>
          )}
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
}

export default Feed;
