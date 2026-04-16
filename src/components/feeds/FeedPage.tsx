import { useParams, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { useFeed } from '../../hooks/useHackerNewsApi';
import { Loader } from '../shared/Loader';
import { ErrorMessage } from '../shared/ErrorMessage';
import { FeedItem } from './FeedItem';
import styles from './FeedPage.module.scss';

interface FeedPageProps {
  type: string;
}

export function FeedPage({ type }: FeedPageProps) {
  const { page } = useParams<{ page: string }>();
  const pageNum = page ? parseInt(page, 10) : 1;
  const { stories, error } = useFeed(type, pageNum);
  const listStart = (pageNum - 1) * 30 + 1;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [type, pageNum]);

  return (
    <div className={styles['main-content']}>
      {!stories && !error && <Loader />}
      {!stories && error && <ErrorMessage message={error} />}

      {stories && (
        <div>
          {type === 'jobs' && (
            <p className={styles['job-header']}>
              These are jobs at startups that were funded by Y Combinator. You can also get a job at a YC startup
              through <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
            </p>
          )}
          {type !== 'new' && (
            <ol
              className={`${type !== 'jobs' ? styles['list-margin'] : ''}`}
              start={listStart}
            >
              {stories.map((item) => (
                <li key={item.id} className={styles.post}>
                  <FeedItem item={item} />
                </li>
              ))}
            </ol>
          )}
          <div className={styles.nav}>
            {listStart !== 1 && (
              <Link to={`/${type}/${pageNum - 1}`} className={styles.prev}>
                ‹ Prev
              </Link>
            )}
            {stories.length === 30 && (
              <Link to={`/${type}/${pageNum + 1}`} className={styles.more}>
                More ›
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
