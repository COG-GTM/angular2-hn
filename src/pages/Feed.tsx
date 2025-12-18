import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFeed } from '../hooks/useHackerNews';
import { Item } from '../components/Item';
import { Loader } from '../components/Loader';
import { ErrorMessage } from '../components/ErrorMessage';
import './Feed.scss';

interface FeedProps {
  feedType: string;
}

export function Feed({ feedType }: FeedProps) {
  const { page } = useParams<{ page: string }>();
  const pageNum = page ? parseInt(page, 10) : 1;
  const listStart = (pageNum - 1) * 30 + 1;

  const { data: items, isLoading, error } = useFeed(feedType, pageNum);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [feedType, pageNum]);

  if (isLoading) {
    return (
      <div className="main-content">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="main-content">
        <ErrorMessage message={`Could not load ${feedType} stories.`} />
      </div>
    );
  }

  return (
    <div className="main-content">
      {items && (
        <div>
          {feedType === 'jobs' && (
            <p className="job-header">
              These are jobs at startups that were funded by Y Combinator. You can also get a job
              at a YC startup through{' '}
              <a href="https://triplebyte.com/?ref=yc_jobs" target="_blank" rel="noopener noreferrer">
                Triplebyte
              </a>
              .
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
