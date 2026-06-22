import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { Story } from '../models';
import { fetchFeed } from '../services/api';
import { Loader } from '../components/Loader';
import { ErrorMessage } from '../components/ErrorMessage';
import { Item } from '../components/Item';

interface FeedProps {
  feedType: string;
}

export function Feed({ feedType }: FeedProps) {
  const params = useParams<{ page: string }>();
  const pageNum = params.page ? +params.page : 1;

  const [items, setItems] = useState<Story[] | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState('');
  const [listStart, setListStart] = useState(1);

  useEffect(() => {
    const controller = new AbortController();
    setItems(undefined);
    setErrorMessage('');

    fetchFeed(feedType, pageNum, controller.signal)
      .then((data) => {
        setItems(data);
        setListStart((pageNum - 1) * 30 + 1);
        window.scrollTo(0, 0);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }
        setErrorMessage(`Could not load ${feedType} stories.`);
      });

    return () => controller.abort();
  }, [feedType, pageNum]);

  return (
    <div className="main-content">
      {!items && !errorMessage && <Loader />}
      {!items && errorMessage !== '' && <ErrorMessage message={errorMessage} />}

      {items && (
        <div>
          {feedType === 'jobs' && (
            <p className="job-header">
              These are jobs at startups that were funded by Y Combinator. You can also get a job
              at a YC startup through{' '}
              <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
            </p>
          )}
          <ol className={feedType !== 'jobs' ? 'list-margin' : undefined} start={listStart}>
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
  );
}
