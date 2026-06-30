import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import type { Story } from '../../models/story';
import { fetchFeed } from '../../services/hackernews-api';
import Loader from '../../components/Loader/Loader';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import Item from '../../components/Item/Item';
import './Feed.scss';

interface FeedProps {
  feedType: string;
}

export default function Feed({ feedType }: FeedProps) {
  const { page } = useParams();
  const pageNum = page ? +page : 1;

  const [items, setItems] = useState<Story[] | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState('');
  const [listStart, setListStart] = useState(0);

  useEffect(() => {
    let ignore = false;
    setItems(undefined);
    setErrorMessage('');

    fetchFeed(feedType, pageNum)
      .then((fetchedItems) => {
        if (ignore) return;
        setItems(fetchedItems);
        setListStart((pageNum - 1) * 30 + 1);
        window.scrollTo(0, 0);
      })
      .catch(() => {
        if (ignore) return;
        setErrorMessage('Could not load ' + feedType + ' stories.');
      });

    return () => {
      ignore = true;
    };
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
