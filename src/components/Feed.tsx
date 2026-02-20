import { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { fetchFeed } from '../services/hackernews-api';
import type { Story } from '../types';
import Loader from './Loader';
import ErrorMessage from './ErrorMessage';
import Item from './Item';
import './Feed.scss';

export default function Feed() {
  const [items, setItems] = useState<Story[] | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const { page } = useParams<{ page: string }>();
  const location = useLocation();

  const feedType = location.pathname.split('/')[1] || 'news';
  const pageNum = page ? parseInt(page, 10) : 1;
  const listStart = ((pageNum - 1) * 30) + 1;

  useEffect(() => {
    let ignore = false;
    setItems(null);
    setErrorMessage('');

    fetchFeed(feedType, pageNum)
      .then(data => {
        if (!ignore) {
          setItems(data);
          window.scrollTo(0, 0);
        }
      })
      .catch(() => {
        if (!ignore) {
          setErrorMessage('Could not load ' + feedType + ' stories.');
        }
      });
    return () => { ignore = true; };
  }, [feedType, pageNum]);

  return (
    <div className="main-content">
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
          {feedType !== 'new' && (
            <ol className={feedType !== 'jobs' ? 'list-margin' : ''} start={listStart}>
              {items.map(item => (
                <li key={item.id} className="post">
                  <div className="item-block">
                    <Item item={item} />
                  </div>
                </li>
              ))}
            </ol>
          )}
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
