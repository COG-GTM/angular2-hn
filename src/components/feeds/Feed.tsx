import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchFeed } from '../../services/hackerNewsApi';
import type { Story } from '../../types/story';
import { ErrorMessage } from '../shared/ErrorMessage';
import { Loader } from '../shared/Loader';
import { Item } from './Item';
import './Feed.scss';

export function Feed({ feedType }: { feedType: string }) {
  const { page } = useParams();
  const pageNum = page ? Number(page) : 1;

  const [items, setItems] = useState<Story[] | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let ignore = false;
    setItems(undefined);
    setErrorMessage('');

    fetchFeed(feedType, pageNum)
      .then((result) => {
        if (ignore) {
          return;
        }
        setItems(result);
        window.scrollTo(0, 0);
      })
      .catch(() => {
        if (!ignore) {
          setErrorMessage(`Could not load ${feedType} stories.`);
        }
      });

    return () => {
      ignore = true;
    };
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
              These are jobs at startups that were funded by Y Combinator. You can also get a job at
              a YC startup through <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
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
