import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { fetchFeed } from '../../api/hackernews';
import { ErrorMessage } from '../../components/ErrorMessage';
import { Loader } from '../../components/Loader';
import { Story } from '../../models/story';
import { Item } from './Item';

export function Feed({ feedType }: { feedType: string }) {
  const { page } = useParams();
  const pageNum = page ? +page : 1;
  const [items, setItems] = useState<Story[] | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const listStart = (pageNum - 1) * 30 + 1;

  useEffect(() => {
    const controller = new AbortController();
    setItems(null);
    setErrorMessage('');

    fetchFeed(feedType, pageNum, controller.signal)
      .then(stories => {
        if (controller.signal.aborted) {
          return;
        }
        setItems(stories);
        window.scrollTo(0, 0);
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted || (error instanceof Error && error.name === 'AbortError')) {
          return;
        }
        setErrorMessage('Could not load ' + feedType + ' stories.');
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
              These are jobs at startups that were funded by Y Combinator. You can also get a job at
              a YC startup through <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
            </p>
          )}
          <ol className={feedType !== 'jobs' ? 'list-margin' : undefined} start={listStart}>
            {items.map(item => (
              <li key={item.id} className="post">
                <Item className="item-block" item={item} />
              </li>
            ))}
          </ol>
          <div className="nav">
            {listStart !== 1 && (
              <Link to={'/' + feedType + '/' + (pageNum - 1)} className="prev">
                ‹ Prev
              </Link>
            )}
            {items.length === 30 && (
              <Link to={'/' + feedType + '/' + (pageNum + 1)} className="more">
                More ›
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
