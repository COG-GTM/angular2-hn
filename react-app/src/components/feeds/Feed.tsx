import { useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchFeed } from '../../services/hackerNewsApi';
import { useFetch } from '../../hooks/useFetch';
import { Loader } from '../shared/Loader';
import { ErrorMessage } from '../shared/ErrorMessage';
import { Item } from './Item';
import './Feed.scss';

interface FeedProps {
  feedType: string;
}

function Feed({ feedType }: FeedProps) {
  const { page } = useParams<{ page: string }>();
  const currentPage = Number(page) || 1;
  const listStart = (currentPage - 1) * 30 + 1;

  const fetcher = useCallback(
    () => fetchFeed(feedType, currentPage),
    [feedType, currentPage],
  );

  const { data: items, loading, error } = useFetch(
    fetcher,
    [feedType, currentPage],
    `Could not load ${feedType} stories.`,
  );

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} />;
  if (!items) return null;

  return (
    <div className="main-content">
      {feedType === 'jobs' && (
        <p className="job-header">
          These are jobs at startups that were funded by Y Combinator.
          You can also get a job at a YC startup through{' '}
          <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
        </p>
      )}
      <ol
        className={feedType !== 'jobs' ? 'list-margin' : undefined}
        start={listStart}
      >
        {items.map(item => (
          <li key={item.id} className="post">
            <Item item={item} />
          </li>
        ))}
      </ol>
      <div className="nav">
        {listStart !== 1 && (
          <Link to={`/${feedType}/${currentPage - 1}`} className="prev">
            ‹ Prev
          </Link>
        )}
        {items.length === 30 && (
          <Link to={`/${feedType}/${currentPage + 1}`} className="more">
            More ›
          </Link>
        )}
      </div>
    </div>
  );
}

export default Feed;
