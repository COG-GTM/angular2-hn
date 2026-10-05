import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { useFeed } from '../../api/hooks';
import { ErrorMessage } from '../../components/ErrorMessage/ErrorMessage';
import { Loader } from '../../components/Loader/Loader';
import { STORIES_PER_PAGE, type FeedName } from '../../models';
import { FeedItem } from './FeedItem';
import './Feed.scss';

export default function FeedPage({ feedType }: { feedType: FeedName }) {
  const { page } = useParams();
  const pageNum = page ? Number(page) : 1;
  const { data: items, isError, isSuccess, isPlaceholderData } = useFeed(feedType, pageNum);
  const loadedPage = isSuccess && !isPlaceholderData;
  // Like Angular, `listStart` only advances once the new page has loaded.
  const [shownPage, setShownPage] = useState(pageNum);
  const listStart = (shownPage - 1) * STORIES_PER_PAGE + 1;

  useEffect(() => {
    if (loadedPage) {
      setShownPage(pageNum);
      window.scrollTo(0, 0);
    }
  }, [feedType, pageNum, loadedPage]);

  return (
    <div className="main-content feed">
      {!items && !isError && <Loader />}
      {!items && isError && <ErrorMessage message={`Could not load ${feedType} stories.`} />}

      {items && (
        <div>
          {feedType === 'jobs' && (
            <p className="job-header">
              {
                ' These are jobs at startups that were funded by Y Combinator. You can also get a job at a YC startup through '
              }
              <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.{' '}
            </p>
          )}
          <ol className={feedType !== 'jobs' ? 'list-margin' : undefined} start={listStart}>
            {items.map((item) => (
              <li key={item.id} className="post">
                <FeedItem item={item} />
              </li>
            ))}
          </ol>
          <div className="nav">
            {listStart !== 1 && (
              <Link to={`/${feedType}/${pageNum - 1}`} className="prev">
                {' ‹ Prev '}
              </Link>
            )}
            {items.length === STORIES_PER_PAGE && (
              <Link to={`/${feedType}/${pageNum + 1}`} className="more">
                {' More › '}
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
