import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useFeed } from '../../hooks/useFeed';
import FeedItem from '../../components/FeedItem/FeedItem';
import Loader from '../../components/Loader/Loader';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import './FeedPage.scss';

const VALID_FEED_TYPES = ['news', 'newest', 'show', 'ask', 'jobs'];

export default function FeedPage() {
  const { feedType = 'news', page = '1' } = useParams<{ feedType: string; page: string }>();
  const pageNum = parseInt(page, 10) || 1;
  const { items, error } = useFeed(feedType, pageNum);
  const listStart = (pageNum - 1) * 30 + 1;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [feedType, pageNum]);

  if (!VALID_FEED_TYPES.includes(feedType)) {
    return <ErrorMessage message={`Unknown feed type: ${feedType}`} />;
  }

  return (
    <div className="main-content">
      {!items && !error && <Loader />}
      {!items && error && <ErrorMessage message={error} />}

      {items && (
        <div>
          {feedType === 'jobs' && (
            <p className="job-header">
              These are jobs at startups that were funded by Y Combinator. You can also
              get a job at a YC startup through{' '}
              <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
            </p>
          )}
          {feedType !== 'new' && (
            <ol
              className={feedType !== 'jobs' ? 'list-margin' : undefined}
              start={listStart}
            >
              {items.map((item) => (
                <li key={item.id} className="post">
                  <FeedItem item={item} />
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
