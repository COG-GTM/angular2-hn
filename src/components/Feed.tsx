import { useParams, Link } from 'react-router-dom';
import { useFeed } from '../hooks/useHackerNewsAPI';
import FeedItem from './FeedItem';
import Loader from './Loader';
import ErrorMessage from './ErrorMessage';
import '../styles/Feed.scss';

export default function Feed() {
  const { feedType = 'news', page = '1' } = useParams();
  const pageNum = parseInt(page, 10);
  const { items, loading, error } = useFeed(feedType, pageNum);
  const listStart = ((pageNum - 1) * 30) + 1;

  if (loading && !items) {
    return (
      <div className="main-content">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="main-content">
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <div className="main-content">
      {items && (
        <div>
          {feedType === 'jobs' && (
            <p className="job-header">
              These are jobs at startups that were funded by Y Combinator.
              You can also get a job at a YC startup through <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
            </p>
          )}
          <ol className={feedType !== 'jobs' ? 'list-margin' : ''} start={listStart}>
            {items.map(item => (
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
      )}
    </div>
  );
}
