import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchFeed } from '../../services/hackernews-api';
import type { Story } from '../../types/story';
import ErrorMessage from '../ErrorMessage/ErrorMessage';
import Item from '../Item/Item';
import Loader from '../Loader/Loader';
import './Feed.scss';

interface FeedProps {
  feedType: string;
}

export default function Feed({ feedType }: FeedProps) {
  const { page } = useParams<{ page: string }>();
  const pageNum = page ? Number(page) : 1;
  const listStart = (pageNum - 1) * 30 + 1;

  const [items, setItems] = useState<Story[] | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let cancelled = false;
    setItems(null);
    setErrorMessage('');

    fetchFeed(feedType, pageNum)
      .then((data) => {
        if (cancelled) return;
        setItems(data);
        window.scrollTo(0, 0);
      })
      .catch(() => {
        if (cancelled) return;
        setErrorMessage(`Could not load ${feedType} stories.`);
      });

    return () => {
      cancelled = true;
    };
  }, [feedType, pageNum]);

  if (!items && !errorMessage) {
    return (
      <div className="main-content">
        <Loader />
      </div>
    );
  }

  if (!items && errorMessage) {
    return (
      <div className="main-content">
        <ErrorMessage message={errorMessage} />
      </div>
    );
  }

  if (!items) {
    return null;
  }

  return (
    <div className="main-content">
      <div>
        {feedType === 'jobs' ? (
          <p className="job-header">
            These are jobs at startups that were funded by Y Combinator. You can
            also get a job at a YC startup through{' '}
            <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
          </p>
        ) : null}
        <ol
          className={feedType !== 'jobs' ? 'list-margin' : undefined}
          start={listStart}
        >
          {items.map((item) => (
            <li key={item.id} className="post">
              <div className="item-block">
                <Item item={item} />
              </div>
            </li>
          ))}
        </ol>
        <div className="nav">
          {listStart !== 1 ? (
            <Link to={`/${feedType}/${pageNum - 1}`} className="prev">
              ‹ Prev
            </Link>
          ) : null}
          {items.length === 30 ? (
            <Link to={`/${feedType}/${pageNum + 1}`} className="more">
              More ›
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
