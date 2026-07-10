import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { fetchFeed } from '../../api/hackernews';
import ErrorMessage from '../../components/ErrorMessage';
import Loader from '../../components/Loader';
import { Story } from '../../types/story';
import Item from '../item/Item';
import '../../styles/feed.scss';

interface FeedProps {
  feedType: string;
}

export default function Feed({ feedType }: FeedProps) {
  const { page } = useParams();
  const pageNum = page ? Number(page) : 1;

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
      .catch(() => {
        if (controller.signal.aborted) {
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
              These are jobs at startups that were funded by Y Combinator. You
              can also get a job at a YC startup through{' '}
              <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
            </p>
          )}
          {feedType !== 'new' && (
            <ol
              className={feedType !== 'jobs' ? 'list-margin' : undefined}
              start={listStart}
            >
              {items.map((item) => (
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
