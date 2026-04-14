import { useParams, Link } from 'react-router-dom';
import { useFeed } from '../../hooks/useFeed';
import FeedItem from './FeedItem';
import Loader from '../shared/Loader';
import ErrorMessage from '../shared/ErrorMessage';
import './FeedPage.scss';

export default function FeedPage() {
  const { feedType = 'news', page = '1' } = useParams<{ feedType: string; page: string }>();
  const pageNum = parseInt(page, 10) || 1;
  const { items, error, loading } = useFeed(feedType, pageNum);

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="feed">
      <div className="feed-list">
        {items.map((item, index) => (
          <FeedItem
            key={item.id}
            item={item}
            index={(pageNum - 1) * 30 + index}
          />
        ))}
      </div>
      {items.length > 0 && (
        <div className="feed-pagination">
          {pageNum > 1 && (
            <Link to={`/${feedType}/${pageNum - 1}`} className="feed-pagination-link">
              &laquo; Prev
            </Link>
          )}
          <span className="feed-pagination-page">Page {pageNum}</span>
          {items.length >= 30 && (
            <Link to={`/${feedType}/${pageNum + 1}`} className="feed-pagination-link">
              Next &raquo;
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
