import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useFeed } from '../hooks';
import { Item } from '../components/feeds';
import { Loader, ErrorMessage } from '../components/shared';
import './FeedPage.scss';

interface FeedPageProps {
  feedType: string;
}

export function FeedPage({ feedType }: FeedPageProps) {
  const { page } = useParams<{ page: string }>();
  const pageNum = page ? parseInt(page, 10) : 1;
  const { items, loading, error } = useFeed(feedType, pageNum);
  const listStart = (pageNum - 1) * 30 + 1;

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
              These are jobs at startups that were funded by Y Combinator. You can also get a job
              at a YC startup through{' '}
              <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
            </p>
          )}
          {feedType !== 'new' && (
            <ol className={feedType !== 'jobs' ? 'list-margin' : ''} start={listStart}>
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
      )}
    </div>
  );
}
