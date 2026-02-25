import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchFeed } from '../api';
import type { Story } from '../api';
import Item from '../components/Item';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import './FeedPage.css';

export default function FeedPage() {
  const { feedType, page } = useParams();
  const pageNum = page ? +page : 1;
  const [items, setItems] = useState<Story[] | null>(null);
  const [error, setError] = useState('');
  const listStart = (pageNum - 1) * 30 + 1;

  useEffect(() => {
    setItems(null);
    setError('');
    fetchFeed(feedType!, pageNum)
      .then(setItems)
      .catch(() => setError(`Could not load ${feedType} stories.`));
    window.scrollTo(0, 0);
  }, [feedType, pageNum]);

  return (
    <div className="main-content">
      {!items && !error && <Loader />}
      {!items && error !== '' && <ErrorMessage message={error} />}

      {items && (
        <div>
          {feedType === 'jobs' && (
            <p className="job-header">
              These are jobs at startups that were funded by Y Combinator.
              You can also get a job at a YC startup through{' '}
              <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
            </p>
          )}
          <ol
            className={feedType !== 'jobs' ? 'list-margin' : undefined}
            start={listStart}
          >
            {items.map(item => (
              <li key={item.id} className="post">
                <Item item={item} />
              </li>
            ))}
          </ol>
          <div className="nav">
            {listStart !== 1 && (
              <Link
                to={`/${feedType}/${pageNum - 1}`}
                className="prev"
              >
                &#8249; Prev
              </Link>
            )}
            {items.length === 30 && (
              <Link
                to={`/${feedType}/${pageNum + 1}`}
                className="more"
              >
                More &#8250;
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
