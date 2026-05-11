import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchFeed } from '../api/hackerNewsApi';
import type { Story } from '../types/story';
import type { FeedRoute } from '../types/feed-type';
import { Loader } from '../components/Loader';
import { ErrorMessage } from '../components/ErrorMessage';
import { FeedItem } from '../components/FeedItem';
import './Feed.scss';

const PAGE_SIZE = 30;

export function Feed() {
  const params = useParams<{ feedType: FeedRoute; page: string }>();
  const feedType = params.feedType ?? 'news';
  const pageNum = params.page ? Math.max(1, parseInt(params.page, 10) || 1) : 1;
  const requestKey = `${feedType}/${pageNum}`;

  const [items, setItems] = useState<Story[] | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [prevKey, setPrevKey] = useState(requestKey);

  if (prevKey !== requestKey) {
    setPrevKey(requestKey);
    setItems(null);
    setErrorMessage('');
  }

  const doFetch = useCallback((ft: string, page: number, signal: AbortSignal) => {
    fetchFeed(ft, page, signal)
      .then((result) => {
        setItems(result);
        window.scrollTo(0, 0);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setErrorMessage(`Could not load ${ft} stories.`);
      });
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    doFetch(feedType, pageNum, controller.signal);
    return () => controller.abort();
  }, [feedType, pageNum, doFetch]);

  const listStart = (pageNum - 1) * PAGE_SIZE + 1;
  const showLoader = !items && !errorMessage;
  const showError = !items && errorMessage !== '';

  return (
    <div className="main-content feed-page">
      {showLoader && <Loader />}
      {showError && <ErrorMessage message={errorMessage} />}

      {items && (
        <div>
          {feedType === 'jobs' && (
            <p className="job-header">
              These are jobs at startups that were funded by Y Combinator. You
              can also get a job at a YC startup through{' '}
              <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
            </p>
          )}
          <ol
            className={feedType !== 'jobs' ? 'list-margin' : undefined}
            start={listStart}
          >
            {items.map((item) => (
              <li key={item.id} className="post">
                <div className="item-block">
                  <FeedItem item={item} />
                </div>
              </li>
            ))}
          </ol>
          <div className="nav">
            {listStart !== 1 && (
              <Link
                to={`/${feedType}/${pageNum - 1}`}
                className="prev"
              >
                ‹ Prev
              </Link>
            )}
            {items.length === PAGE_SIZE && (
              <Link
                to={`/${feedType}/${pageNum + 1}`}
                className="more"
              >
                More ›
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Feed;
