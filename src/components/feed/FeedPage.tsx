import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useFeed } from '../../shared/hooks/useHackerNewsApi';
import { Loader, ErrorMessage } from '../../shared/components';
import FeedItem from './FeedItem';
import styles from '../../styles/FeedPage.module.css';

export default function FeedPage() {
  const { feedType = '', page: pageParam } = useParams();
  const page = pageParam ? Number(pageParam) : 1;
  const { items, error, loading } = useFeed(feedType, page);
  const listStart = (page - 1) * 30 + 1;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);

  return (
    <div className={styles['main-content']}>
      {loading ? (
        <Loader />
      ) : error ? (
        <ErrorMessage errorMessage={error} />
      ) : (
        <div>
          {feedType === 'jobs' && (
            <p className={styles['job-header']}>
              These are jobs at startups that were funded by Y Combinator. You can also
              get a job at a YC startup through{' '}
              <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
            </p>
          )}
          {feedType !== 'new' && (
            <ol
              className={feedType !== 'jobs' ? styles['list-margin'] : undefined}
              start={listStart}
            >
              {items.map((item) => (
                <li key={item.id} className={styles.post}>
                  <FeedItem item={item} />
                </li>
              ))}
            </ol>
          )}
          <nav className={styles.nav}>
            {listStart !== 1 && (
              <Link to={`/${feedType}/${page - 1}`} className={styles.prev}>
                ‹ Prev
              </Link>
            )}
            {items.length === 30 && (
              <Link to={`/${feedType}/${page + 1}`} className={styles.more}>
                More ›
              </Link>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
