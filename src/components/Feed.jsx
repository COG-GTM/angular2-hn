import { useParams, useLocation, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useHackerNewsAPI } from '../hooks/useHackerNewsAPI';
import Item from './Item';
import Loader from './Loader';
import ErrorMessage from './ErrorMessage';
import './Feed.scss';

export default function Feed() {
  const { page } = useParams();
  const location = useLocation();
  const [items, setItems] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const { fetchFeed } = useHackerNewsAPI();

  const feedType = location.pathname.split('/')[1];
  const pageNum = page ? parseInt(page) : 1;
  const listStart = ((pageNum - 1) * 30) + 1;

  useEffect(() => {
    setLoading(true);
    setErrorMessage('');
    setItems(null);

    fetchFeed(feedType, pageNum)
      .then(data => {
        setItems(data);
        window.scrollTo(0, 0);
      })
      .catch(() => setErrorMessage(`Could not load ${feedType} stories.`))
      .finally(() => setLoading(false));
  }, [feedType, pageNum, fetchFeed]);

  return (
    <div className="main-content">
      {loading && !errorMessage && <Loader />}
      {!loading && errorMessage && <ErrorMessage message={errorMessage} />}

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
                  <Item item={item} />
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
