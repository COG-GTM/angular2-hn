import { useEffect, useReducer } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchFeed } from '../api/hackerNewsApi';
import type { Story } from '../types/Story';
import { Item } from '../components/Item';
import { Loader } from '../components/Loader';
import { ErrorMessage } from '../components/ErrorMessage';
import './Feed.scss';

interface FeedProps {
  feedType: string;
}

interface FeedState {
  items: Story[] | null;
  errorMessage: string;
}

type FeedAction =
  | { type: 'loading' }
  | { type: 'loaded'; items: Story[] }
  | { type: 'error'; message: string };

function feedReducer(_state: FeedState, action: FeedAction): FeedState {
  switch (action.type) {
    case 'loading':
      return { items: null, errorMessage: '' };
    case 'loaded':
      return { items: action.items, errorMessage: '' };
    case 'error':
      return { items: null, errorMessage: action.message };
  }
}

export function Feed({ feedType }: FeedProps) {
  const { page } = useParams<{ page: string }>();
  const pageNum = page ? parseInt(page, 10) : 1;
  const [state, dispatch] = useReducer(feedReducer, {
    items: null,
    errorMessage: '',
  });

  useEffect(() => {
    let cancelled = false;
    dispatch({ type: 'loading' });

    fetchFeed(feedType, pageNum)
      .then((data) => {
        if (!cancelled) {
          dispatch({ type: 'loaded', items: data });
          window.scrollTo(0, 0);
        }
      })
      .catch(() => {
        if (!cancelled) {
          dispatch({
            type: 'error',
            message: `Could not load ${feedType} stories.`,
          });
        }
      });

    return () => { cancelled = true; };
  }, [feedType, pageNum]);

  const { items, errorMessage } = state;
  const listStart = (pageNum - 1) * 30 + 1;

  return (
    <div className="main-content">
      {!items && !errorMessage && <Loader />}
      {!items && errorMessage && <ErrorMessage message={errorMessage} />}

      {items && (
        <div>
          {feedType === 'jobs' && (
            <p className="job-header">
              These are jobs at startups that were funded by Y Combinator. You
              can also get a job at a YC startup through{' '}
              <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
            </p>
          )}

          {feedType !== 'new' && (
            <ol
              className={feedType !== 'jobs' ? 'list-margin' : undefined}
              start={listStart}
            >
              {items.map((item, index) => (
                <li key={item.id} className="post">
                  <Item item={item} index={listStart + index} />
                </li>
              ))}
            </ol>
          )}

          <div className="nav">
            {listStart !== 1 && (
              <Link to={`/${feedType}/${pageNum - 1}`} className="prev">
                &lsaquo; Prev
              </Link>
            )}
            {items.length === 30 && (
              <Link to={`/${feedType}/${pageNum + 1}`} className="more">
                More &rsaquo;
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
