import { useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchFeed } from '../../services/hackerNewsApi';
import { useFetch } from '../../hooks/useFetch';
import { Loader } from '../shared/Loader';
import { ErrorMessage } from '../shared/ErrorMessage';
import { Item } from './Item';

interface FeedProps {
  feedType: string;
}

function Feed({ feedType }: FeedProps) {
  const { page } = useParams<{ page: string }>();
  const currentPage = Number(page) || 1;

  const fetcher = useCallback(
    () => fetchFeed(feedType, currentPage),
    [feedType, currentPage],
  );

  const { data: items, loading, error } = useFetch(
    fetcher,
    [feedType, currentPage],
    'Error fetching stories',
  );

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} />;
  if (!items) return null;

  return (
    <div className="feed">
      {feedType === 'jobs' && <div className="job-header">Hacker News: Jobs</div>}
      <ol start={(currentPage - 1) * 30 + 1}>
        {items.map(item => (
          <Item key={item.id} item={item} />
        ))}
      </ol>
      <div className="pagination">
        {currentPage > 1 && (
          <Link to={`/${feedType}/${currentPage - 1}`} className="prev">
            &lt; Prev
          </Link>
        )}
        {items.length >= 30 && (
          <Link to={`/${feedType}/${currentPage + 1}`} className="more">
            More &gt;
          </Link>
        )}
      </div>
    </div>
  );
}

export default Feed;
