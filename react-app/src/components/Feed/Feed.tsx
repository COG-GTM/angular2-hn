import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Story } from '../../models/story';
import { fetchFeed } from '../../services/hackernews-api';
import { FeedItem } from '../FeedItem/FeedItem';
import { Loader } from '../Loader/Loader';
import { ErrorMessage } from '../ErrorMessage/ErrorMessage';
import './Feed.scss';

interface FeedProps {
  feedType: string;
}

export function Feed({ feedType }: FeedProps) {
  const { page } = useParams<{ page: string }>();
  const pageNum = parseInt(page || '1', 10);
  const [items, setItems] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const listStart = ((pageNum - 1) * 30) + 1;

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError(false);
    window.scrollTo(0, 0);
    fetchFeed(feedType, pageNum)
      .then((data) => {
        if (!ignore) {
          setItems(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!ignore) {
          setError(true);
          setLoading(false);
        }
      });
    return () => { ignore = true; };
  }, [feedType, pageNum]);

  if (loading) {
    return (
      <div className="main-content">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="main-content">
        <ErrorMessage />
      </div>
    );
  }

  return (
    <div className="main-content">
      {feedType === 'jobs' && (
        <p className="job-header">
          These are jobs at startups that were funded by Y Combinator.
          You can also get a job at a YC startup through <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
        </p>
      )}
      <ol className={feedType !== 'jobs' ? 'list-margin' : ''} start={listStart}>
        {items.map((item) => (
          <li key={item.id} className="post">
            <FeedItem item={item} />
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
  );
}
