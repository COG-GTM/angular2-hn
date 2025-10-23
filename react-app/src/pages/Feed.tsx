import { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { Story } from '../types/story';
import { hackerNewsAPIService } from '../services/hackernews-api.service';
import { Loader } from '../components/Loader';
import { ErrorMessage } from '../components/ErrorMessage';
import { Item } from '../components/Item';

export function Feed() {
  const { page } = useParams<{ page: string }>();
  const location = useLocation();
  const [items, setItems] = useState<Story[] | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  
  const feedType = location.pathname.split('/')[1];
  const pageNum = page ? parseInt(page, 10) : 1;
  const listStart = ((pageNum - 1) * 30) + 1;

  useEffect(() => {
    setItems(null);
    setErrorMessage('');
    
    hackerNewsAPIService
      .fetchFeed(feedType, pageNum)
      .then((fetchedItems) => {
        setItems(fetchedItems);
        window.scrollTo(0, 0);
      })
      .catch(() => {
        setErrorMessage(`Could not load ${feedType} stories.`);
      });
  }, [feedType, pageNum]);

  if (!items && !errorMessage) {
    return <Loader />;
  }

  if (!items && errorMessage) {
    return <ErrorMessage message={errorMessage} />;
  }

  return (
    <div className="main-content p-4 max-w-4xl mx-auto">
      {items && (
        <div>
          {feedType === 'jobs' && (
            <p className="job-header bg-yellow-50 dark:bg-yellow-900 p-4 mb-4 rounded">
              These are jobs at startups that were funded by Y Combinator.
              You can also get a job at a YC startup through{' '}
              <a
                href="https://triplebyte.com/?ref=yc_jobs"
                className="underline hover:text-blue-600"
              >
                Triplebyte
              </a>
              .
            </p>
          )}
          
          <ol
            className={feedType !== 'jobs' ? 'list-margin' : ''}
            start={listStart}
          >
            {items.map((item) => (
              <li key={item.id} className="post mb-4">
                <Item item={item} />
              </li>
            ))}
          </ol>

          <div className="nav flex gap-4 mt-8 mb-4">
            {listStart !== 1 && (
              <Link
                to={`/${feedType}/${pageNum - 1}`}
                className="prev px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                ‹ Prev
              </Link>
            )}
            {items.length === 30 && (
              <Link
                to={`/${feedType}/${pageNum + 1}`}
                className="more px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                More ›
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
