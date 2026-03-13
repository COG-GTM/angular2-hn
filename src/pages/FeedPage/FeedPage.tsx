import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Story } from '../../types/story';
import { fetchFeed } from '../../services/hackerNewsApi';
import { ItemCard } from '../../components/ItemCard/ItemCard';
import { Loader } from '../../components/Loader/Loader';
import { ErrorMessage } from '../../components/ErrorMessage/ErrorMessage';
import './FeedPage.scss';

export function FeedPage() {
  const { feedType = 'news', page = '1' } = useParams<{ feedType: string; page: string }>();
  const pageNum = parseInt(page, 10) || 1;
  const [items, setItems] = useState<Story[] | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

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
          setErrorMessage(`Could not load ${feedType} stories.`);
        }
      });
    return () => { ignore = true; };
  }, [feedType, pageNum]);

  const listStart = ((pageNum - 1) * 30) + 1;

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
          <ol className={feedType !== 'jobs' ? 'list-margin' : ''} start={listStart}>
            {items.map(item => (
              <li key={item.id} className="post">
                <div className="item-block">
                  <ItemCard item={item} />
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
