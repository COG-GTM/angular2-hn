import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Story } from '../models/story';
import { FeedType } from '../models/feed-type.type';
import { fetchFeed } from '../services/hackerNewsApi';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import FeedItem from '../components/FeedItem';
import './Feed.scss';

export interface FeedProps {
  feedType: string;
}

export default function Feed({ feedType }: FeedProps) {
  const params = useParams();
  const pageNum = params.page ? +params.page : 1;

  const [items, setItems] = useState<Story[] | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const listStart = ((pageNum - 1) * 30) + 1;

  useEffect(() => {
    let active = true;
    setItems(null);
    setErrorMessage('');

    fetchFeed(feedType, pageNum)
      .then(data => {
        if (!active) return;
        setItems(data);
        window.scrollTo(0, 0);
      })
      .catch(() => {
        if (!active) return;
        setErrorMessage(`Could not load ${feedType} stories.`);
      });

    return () => {
      active = false;
    };
  }, [feedType, pageNum]);

  return (
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
          <ol className={feedType !== 'jobs' ? 'list-margin' : undefined} start={listStart}>
            {items.map(item => (
              <li key={item.id} className="post">
                <div className="item-block">
                  <FeedItem item={item} />
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
  );
}

export type { FeedType };
