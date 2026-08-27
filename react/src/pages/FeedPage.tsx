import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchFeed } from '../api/hackerNewsApi';
import { useSettings } from '../context/SettingsContext';
import type { FeedType, Story } from '../types/models';
import { ErrorMessage } from '../components/ErrorMessage';
import { Item } from '../components/Item';
import { Loader } from '../components/Loader';

export function FeedPage({ feedType }: { feedType: FeedType }) {
  const { page = '1' } = useParams();
  const pageNum = Number.parseInt(page, 10) || 1;
  const listStart = (pageNum - 1) * 30 + 1;
  const [items, setItems] = useState<Story[] | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  useSettings();

  useEffect(() => {
    const controller = new AbortController();
    setItems(null);
    setErrorMessage('');
    fetchFeed(feedType, pageNum, controller.signal).then((nextItems) => {
      setItems(nextItems);
      window.scrollTo(0, 0);
    }).catch((error: unknown) => {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      setErrorMessage(`Could not load ${feedType} stories.`);
    });
    return () => controller.abort();
  }, [feedType, pageNum]);

  return (
    <div className="main-content">
      {!items && !errorMessage && <Loader />}
      {!items && errorMessage && <ErrorMessage message={errorMessage} />}
      {items && <>
        {feedType === 'jobs' && <p className="job-header">These are jobs at startups that were funded by Y Combinator. You can also get a job at a YC startup through <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.</p>}
        <ol className={feedType !== 'jobs' ? 'list-margin' : undefined} start={listStart}>
          {items.map((item) => <li key={item.id} className="post"><Item item={item} /></li>)}
        </ol>
        <div className="nav">
          {listStart !== 1 && <Link to={`/${feedType}/${pageNum - 1}`} className="prev">‹ Prev</Link>}
          {items.length === 30 && <Link to={`/${feedType}/${pageNum + 1}`} className="more">More ›</Link>}
        </div>
      </>}
    </div>
  );
}
