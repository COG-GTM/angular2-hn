import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchFeed } from '../services/hackerNewsApi';
import { Story } from '../models/story';
import Item from '../components/Item';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import './FeedPage.scss';

interface FeedPageProps {
  feedType: string;
}

function FeedPage({ feedType }: FeedPageProps) {
  const { page } = useParams<{ page: string }>();
  const pageNum = page ? parseInt(page, 10) : 1;
  const [items, setItems] = useState<Story[] | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setItems(null);
    setErrorMessage('');

    fetchFeed(feedType, pageNum)
      .then(data => setItems(data))
      .catch(() => setErrorMessage(`Could not load ${feedType} stories.`));

    window.scrollTo(0, 0);
  }, [feedType, pageNum]);

  const listStart = (pageNum - 1) * 30 + 1;

  return (
    <div className="main-content">
      {!items && !errorMessage && <Loader />}
      {!items && errorMessage !== '' && <ErrorMessage message={errorMessage} />}

      {items && (
        <div>
          {feedType === 'jobs' && (
            <p className="job-header">
              These are jobs at startups that were funded by Y Combinator.
              You can also get a job at a YC startup through{' '}
              <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
            </p>
          )}
          {feedType !== 'new' && (
            <ol className={feedType !== 'jobs' ? 'list-margin' : undefined} start={listStart}>
              {items.map(item => (
                <li key={item.id} className="post">
                  <Item item={item} />
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
      )}
    </div>
  );
}

export default FeedPage;
