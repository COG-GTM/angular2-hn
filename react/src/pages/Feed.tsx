import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { fetchFeed } from '../api/hackernews-api';
import type { Story } from '../models';
import Item from '../components/Item';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import './feed.scss';

interface FeedResult {
  key: string;
  items?: Story[];
  errorMessage?: string;
}

function Feed() {
  const params = useParams();
  const feedType = params.feedType ?? 'news';
  const pageNum = params.page ? +params.page : 1;
  const feedKey = `${feedType}/${pageNum}`;

  const [result, setResult] = useState<FeedResult | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchFeed(feedType, pageNum)
      .then((stories) => {
        if (cancelled) return;
        setResult({ key: `${feedType}/${pageNum}`, items: stories });
        window.scrollTo(0, 0);
      })
      .catch(() => {
        if (cancelled) return;
        setResult({
          key: `${feedType}/${pageNum}`,
          errorMessage: 'Could not load ' + feedType + ' stories.',
        });
      });

    return () => {
      cancelled = true;
    };
  }, [feedType, pageNum]);

  const current = result?.key === feedKey ? result : null;
  const items = current?.items;
  const errorMessage = current?.errorMessage ?? '';
  const listStart = ((pageNum - 1) * 30) + 1;

  return (
    <div className="app-feed main-content">
      {!items && !errorMessage && <Loader />}
      {!items && errorMessage !== '' && <ErrorMessage message={errorMessage} />}

      {items && (
        <div>
          {feedType === 'jobs' && (
            <p className="job-header">
              These are jobs at startups that were funded by Y Combinator.
              You can also get a job at a YC startup through{' '}
              <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
            </p>
          )}
          <ol className={feedType !== 'jobs' ? 'list-margin' : undefined} start={listStart}>
            {items.map((item) => (
              <li key={item.id} className="post">
                <Item item={item} />
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

export default Feed;
