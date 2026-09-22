import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

import { ErrorMessage } from '../components/ErrorMessage/ErrorMessage';
import { Loader } from '../components/Loader/Loader';
import { StoryItem } from '../components/StoryItem/StoryItem';
import { useAsync } from '../hooks/useAsync';
import type { FeedName } from '../models';
import { fetchFeed } from '../services/hackerNewsApi';
import './FeedPage.scss';

export function FeedPage({ feedType }: { feedType: FeedName }) {
  const params = useParams<{ page?: string }>();
  const pageNum = params.page ? Number(params.page) : 1;
  const { data: items, error } = useAsync((signal) => fetchFeed(feedType, pageNum, signal), [feedType, pageNum]);
  const listStart = (pageNum - 1) * 30 + 1;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [feedType, pageNum]);

  return (
    <div className="main-content">
      {!items && !error && <Loader />}
      {!items && error && <ErrorMessage message={`Could not load ${feedType} stories.`} />}

      {items && (
        <div>
          {feedType === 'jobs' && (
            <p className="job-header">
              These are jobs at startups that were funded by Y Combinator. You can also get a job at a YC startup
              through <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
            </p>
          )}
          <ol className={feedType !== 'jobs' ? 'list-margin' : undefined} start={listStart}>
            {items.map((item) => (
              <li key={item.id} className="post">
                <StoryItem item={item} />
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
