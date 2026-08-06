import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import FeedItem from '../../components/FeedItem/FeedItem';
import Loader from '../../components/Loader/Loader';
import { Story } from '../../models/Story';
import { fetchFeed } from '../../services/hackerNewsApi';

import styles from './Feed.module.scss';

interface FeedProps {
  feedType: string;
}

const Feed: React.FC<FeedProps> = ({ feedType }) => {
  const { page } = useParams<{ page: string }>();
  const pageNum = page ? +page : 1;
  const [items, setItems] = useState<Story[] | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    setItems(null);
    setErrorMessage('');

    fetchFeed(feedType, pageNum, controller.signal)
      .then(data => {
        setItems(data);
        window.scrollTo(0, 0);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setErrorMessage(`Could not load ${feedType} stories.`);
        }
      });

    return () => controller.abort();
  }, [feedType, pageNum]);

  const listStart = ((pageNum - 1) * 30) + 1;

  return (
    <div className={styles.host}>
      {!items && !errorMessage && <Loader />}
      {!items && errorMessage !== '' && <ErrorMessage message={errorMessage} />}

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
              <Link to={`/${feedType}/${pageNum - 1}`} className="prev">‹ Prev</Link>
            )}
            {items.length === 30 && (
              <Link to={`/${feedType}/${pageNum + 1}`} className="more">More ›</Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Feed;
