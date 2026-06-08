import { useEffect, useReducer } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchFeed } from '../../hooks/useHackerNewsApi';
import type { Story } from '../../models/types';
import FeedItem from './FeedItem';
import Loader from '../shared/Loader';
import ErrorMessage from '../shared/ErrorMessage';
import './Feed.scss';

const VALID_FEEDS = ['news', 'newest', 'show', 'ask', 'jobs'];

interface FeedState {
  items: Story[] | null;
  errorMessage: string;
}

type FeedAction =
  | { type: 'loading' }
  | { type: 'success'; items: Story[] }
  | { type: 'error'; message: string };

function feedReducer(_state: FeedState, action: FeedAction): FeedState {
  switch (action.type) {
    case 'loading':
      return { items: null, errorMessage: '' };
    case 'success':
      return { items: action.items, errorMessage: '' };
    case 'error':
      return { items: null, errorMessage: action.message };
  }
}

export default function Feed() {
  const { feedType = 'news', page = '1' } = useParams<{ feedType: string; page: string }>();
  const [state, dispatch] = useReducer(feedReducer, { items: null, errorMessage: '' });

  const pageNum = parseInt(page, 10) || 1;
  const listStart = (pageNum - 1) * 30 + 1;

  useEffect(() => {
    if (!VALID_FEEDS.includes(feedType)) return;

    let cancelled = false;
    dispatch({ type: 'loading' });

    fetchFeed(feedType, pageNum)
      .then(data => {
        if (!cancelled) {
          dispatch({ type: 'success', items: data });
          window.scrollTo(0, 0);
        }
      })
      .catch(() => {
        if (!cancelled) {
          dispatch({ type: 'error', message: `Could not load ${feedType} stories.` });
        }
      });

    return () => { cancelled = true; };
  }, [feedType, pageNum]);

  if (!VALID_FEEDS.includes(feedType)) {
    return <ErrorMessage message={`Invalid feed type: ${feedType}`} />;
  }

  const { items, errorMessage } = state;

  return (
    <div className="main-content">
      {!items && !errorMessage && <Loader />}
      {!items && errorMessage && <ErrorMessage message={errorMessage} />}

      {items && (
        <div>
          {feedType === 'jobs' && (
            <p className="job-header">
              These are jobs at startups that were funded by Y Combinator.
              You can also get a job at a YC startup through <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
            </p>
          )}
          <ol className={feedType !== 'jobs' ? 'list-margin' : undefined} start={listStart}>
            {items.map(item => (
              <li key={item.id} className="post">
                <FeedItem item={item} />
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
}
