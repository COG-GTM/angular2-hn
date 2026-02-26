import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Story } from '../types';
import { fetchFeed } from '../services/hackerNewsApi';
import { feedTypeToPath } from '../utils/feedPaths';
import Item from './Item';
import Loader from './Loader';
import ErrorMessage from './ErrorMessage';
import '../styles/feed.scss';

interface FeedProps {
  feedType: string;
}

export default function Feed({ feedType }: FeedProps) {
  const { page } = useParams<{ page: string }>();
  const [items, setItems] = useState<Story[] | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const pageNum = page ? parseInt(page, 10) : 1;
  const listStart = (pageNum - 1) * 30 + 1;
  const urlPath = feedTypeToPath[feedType] || feedType;

  useEffect(() => {
    setItems(null);
    setErrorMessage('');

    fetchFeed(feedType, pageNum)
      .then((data) => {
        setItems(data);
        window.scrollTo(0, 0);
      })
      .catch(() => {
        setErrorMessage(`Could not load ${feedType} stories.`);
      });
  }, [feedType, pageNum]);

  return (
    <div className="main-content">
      {!items && !errorMessage && <Loader />}
      {!items && errorMessage !== '' && <ErrorMessage message={errorMessage} />}

      {items && (
        <div>
          {feedType === 'jobs' && (
            <p className="job-header">
              These are jobs at startups that were funded by Y Combinator. You can also get a job at
              a YC startup through{' '}
              <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
            </p>
          )}
          <ol
            className={feedType !== 'jobs' ? 'list-margin' : ''}
            start={listStart}
          >
            {items.map((item) => (
              <li key={item.id} className="post">
                <Item item={item} />
              </li>
            ))}
          </ol>
          <div className="nav">
            {listStart !== 1 && (
              <Link to={`/${urlPath}/${pageNum - 1}`} className="prev">
                &#8249; Prev
              </Link>
            )}
            {items.length === 30 && (
              <Link to={`/${urlPath}/${pageNum + 1}`} className="more">
                More &#8250;
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
