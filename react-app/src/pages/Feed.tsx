import { useParams, Link } from 'react-router-dom';
import { useFeed } from '../services/hackerNewsApi';
import { formatCommentCount } from '../utils/formatters';
import Loader from '../components/shared/Loader';
import ErrorMessage from '../components/shared/ErrorMessage';

const Feed = () => {
  const { feedType = 'news', page = '1' } = useParams<{ feedType: string; page: string }>();
  const pageNum = parseInt(page, 10) || 1;
  
  const { data: items, isLoading, error } = useFeed(feedType, pageNum);

  if (isLoading) return <Loader />;
  if (error) return <ErrorMessage message={`Could not load ${feedType} stories.`} />;

  const listStart = ((pageNum - 1) * 30) + 1;

  return (
    <div className="feed">
      <div className="feed-content">
        {items?.map((item, index) => (
          <div key={item.id} className="feed-item">
            <div className="item-rank">{listStart + index}</div>
            <div className="item-content">
              <h3 className="item-title">
                {item.url ? (
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    {item.title}
                  </a>
                ) : (
                  <Link to={`/item/${item.id}`}>{item.title}</Link>
                )}
              </h3>
              <div className="item-meta">
                <span>{item.points} points</span>
                <span>by {item.user}</span>
                <span>{item.time_ago}</span>
                <Link to={`/item/${item.id}`}>
                  {formatCommentCount(item.comments_count)}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="pagination">
        {pageNum > 1 && (
          <Link to={`/${feedType}/${pageNum - 1}`} className="pagination-link">
            Previous
          </Link>
        )}
        <Link to={`/${feedType}/${pageNum + 1}`} className="pagination-link">
          Next
        </Link>
      </div>
    </div>
  );
};

export default Feed;
