import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Story } from '../../types';
import { fetchFeed } from '../../services/hackernews-api';
import { Loader } from '../../components/Loader/Loader';
import { ErrorMessage } from '../../components/ErrorMessage/ErrorMessage';
import { ItemCard } from '../../components/ItemCard/ItemCard';
import './Feed.scss';

interface FeedProps {
  feedType: string;
}

export function Feed({ feedType }: FeedProps) {
  const { page } = useParams<{ page: string }>();
  const pageNum = page ? parseInt(page, 10) : 1;
  const [items, setItems] = useState<Story[] | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const listStart = (pageNum - 1) * 30 + 1;

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    setItems(null);
    setErrorMessage('');

    fetchFeed(feedType, pageNum, controller.signal)
      .then(data => {
        if (!cancelled) setItems(data);
      })
      .catch(err => {
        if (!cancelled && err.name !== 'AbortError') {
          setErrorMessage(`Could not load ${feedType} stories.`);
        }
      });

    window.scrollTo(0, 0);

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [feedType, pageNum]);

  if (!items && !errorMessage) return <Loader />;
  if (!items && errorMessage) return <ErrorMessage message={errorMessage} />;
  if (!items) return null;

  return (
    <div className="main-content">
      {feedType === 'jobs' && (
        <p className="job-header">
          These are jobs at startups that were funded by Y Combinator. You can also get a job at a
          YC startup through{' '}
          <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
        </p>
      )}
      {feedType !== 'new' && (
        <ol
          className={feedType !== 'jobs' ? 'list-margin' : undefined}
          start={listStart}
        >
          {items.map(item => (
            <li key={item.id} className="post">
              <ItemCard item={item} />
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
}
