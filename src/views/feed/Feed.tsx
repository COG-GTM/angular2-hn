import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchFeed } from '../../services/hackerNewsApi';
import { FeedName } from '../../models/feed-name';
import { Story } from '../../models/story';
import ErrorMessage from '../../components/shared/ErrorMessage';
import Loader from '../../components/shared/Loader';
import Item from './Item';
import './Feed.scss';

export default function Feed({ feedType }: { feedType: FeedName }) {
  const { page } = useParams();
  const pageNum = page ? +page : 1;
  const [items, setItems] = useState<Story[]>();
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;
    setItems(undefined);
    setError('');
    fetchFeed(feedType, pageNum)
      .then((nextItems) => {
        if (!ignore) {
          setItems(nextItems);
          window.scrollTo(0, 0);
        }
      })
      .catch(() => {
        if (!ignore) {
          setError(`Could not load ${feedType} stories.`);
        }
      });
    return () => {
      ignore = true;
    };
  }, [feedType, pageNum]);

  const listStart = (pageNum - 1) * 30 + 1;

  return (
    <div className="main-content app-feed">
      {!items && !error && <Loader />}
      {!items && error && <ErrorMessage message={error} />}
      {items && (
        <div>
          {feedType === 'jobs' && (
            <p className="job-header">
              These are jobs at startups that were funded by Y Combinator.
              You can also get a job at a YC startup through <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
            </p>
          )}
          <ol className={feedType !== 'jobs' ? 'list-margin' : undefined} start={listStart}>
            {items.map((item) => (
              <li className="post" key={item.id}>
                <Item item={item} className="item-block" />
              </li>
            ))}
          </ol>
          <div className="nav">
            {listStart !== 1 && (
              <Link to={`/${feedType}/${pageNum - 1}`} className="prev">‹ Prev</Link>
            )}
            {items.length === 30 && (
              <Link to={`/${feedType}/${pageNum + 1}`} className="more">More ›</Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
