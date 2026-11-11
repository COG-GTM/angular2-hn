import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { fetchFeed } from '../api/hackerNewsApi';
import { ErrorMessage } from '../components/ErrorMessage/ErrorMessage';
import { Loader } from '../components/Loader/Loader';
import { FeedItem } from './FeedItem';
import type { FeedType, Story } from '../models';
import './FeedPage.scss';

export function FeedPage({ feedType }: { feedType: FeedType }) {
  const { page } = useParams();
  const pageNum = page ? +page : 1;
  const [result, setResult] = useState<{ items?: Story[]; error?: string }>({});
  useEffect(() => {
    const controller = new AbortController();
    setResult({});
    fetchFeed(feedType, pageNum, controller.signal).then(items => {
      if (controller.signal.aborted) return;
      setResult({ items });
      window.scrollTo(0, 0);
    }).catch(() => {
      if (!controller.signal.aborted) setResult({ error: `Could not load ${feedType} stories.` });
    });
    return () => controller.abort();
  }, [feedType, pageNum]);
  const listStart = (pageNum - 1) * 30 + 1;
  return <div className="feed-page main-content">
    {!result.items && !result.error && <Loader />}
    {!result.items && result.error && <ErrorMessage message={result.error} />}
    {result.items && <div>
      {feedType === 'jobs' && <p className="job-header">
        These are jobs at startups that were funded by Y Combinator.
        {' '}You can also get a job at a YC startup through <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
      </p>}
      <ol className={feedType !== 'jobs' ? 'list-margin' : undefined} start={listStart}>
        {result.items.map(item => <li className="post" key={item.id}><FeedItem item={item} /></li>)}
      </ol>
      <div className="nav">
        {listStart !== 1 && <Link to={`/${feedType}/${pageNum - 1}`} className="prev">‹ Prev</Link>}
        {result.items.length === 30 && <Link to={`/${feedType}/${pageNum + 1}`} className="more">More ›</Link>}
      </div>
    </div>}
  </div>;
}
