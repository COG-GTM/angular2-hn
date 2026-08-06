import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { fetchFeed } from '../../api/hackernewsApi';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import Item from '../../components/Item/Item';
import Loader from '../../components/Loader/Loader';
import type { FeedType, Story } from '../../models';
import './FeedPage.scss';

interface FeedPageProps {
  feedType: FeedType;
}

export default function FeedPage({ feedType }: FeedPageProps) {
  const { page } = useParams();
  const pageNum = page ? Number(page) : 1;

  const [items, setItems] = useState<Story[] | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let cancelled = false;

    setItems(null);
    setErrorMessage('');

    fetchFeed(feedType, pageNum)
      .then((stories) => {
        if (cancelled) return;
        setItems(stories);
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

  const listStart = (pageNum - 1) * 30 + 1;

  return (
    <div className="feed-page">
      <div className="main-content">
      {!items && !errorMessage && <Loader />}
      {!items && errorMessage !== '' && <ErrorMessage message={errorMessage} />}

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
                  <Item item={item} />
                </div>
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
    </div>
  );
}
