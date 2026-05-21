import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { fetchFeed } from '@/services/hackernews-api';
import { useSettings } from '@/contexts/SettingsContext';
import { Loader } from '@/components/Loader';
import { ErrorMessage } from '@/components/ErrorMessage';
import type { Story } from '@/types';
import styles from './FeedPage.module.scss';

function formatComments(count: number): string {
  if (count > 0) {
    return count === 1 ? '1 comment' : `${count} comments`;
  }
  return 'discuss';
}

interface FeedPageProps {
  feedType: string;
}

function FeedItem({ item }: { item: Story }) {
  const { settings } = useSettings();
  const hasUrl = item.url.startsWith('http');

  return (
    <div style={{ marginBottom: `${settings.listSpacing}px` }}>
      <p>
        {hasUrl ? (
          <a
            className={styles.title}
            style={{ fontSize: `${settings.titleFontSize}px` }}
            href={item.url}
            target={settings.openLinkInNewTab ? '_blank' : undefined}
            rel={settings.openLinkInNewTab ? 'noopener' : undefined}
          >
            {item.title}
          </a>
        ) : (
          <Link
            className={styles.title}
            style={{ fontSize: `${settings.titleFontSize}px` }}
            to={`/item/${item.id}`}
          >
            {item.title}
          </Link>
        )}
        {hasUrl && item.domain && <span className="domain"> ({item.domain})</span>}
      </p>
      <div className="subtext-palm">
        {item.type !== 'job' && (
          <div className={styles.details}>
            <span className={styles.name}>
              <Link to={`/user/${item.user}`}>{item.user}</Link>
            </span>
            <span className={styles.right}>{item.points} ★</span>
          </div>
        )}
        <div className={styles.details}>
          {item.time_ago}
          {item.type !== 'job' && (
            <Link to={`/item/${item.id}`} className={styles.commentNumber}>
              {' '}
              • {formatComments(item.comments_count)}
            </Link>
          )}
        </div>
      </div>
      <div className="subtext-laptop">
        {item.type !== 'job' && (
          <span>
            {item.points} points by <Link to={`/user/${item.user}`}>{item.user}</Link>
          </span>
        )}
        <span className={item.type !== 'job' ? styles.itemDetails : undefined}>
          {item.time_ago}
          {item.type !== 'job' && (
            <span>
              {' '}
              | <Link to={`/item/${item.id}`}>{formatComments(item.comments_count)}</Link>
            </span>
          )}
        </span>
      </div>
    </div>
  );
}

export function FeedPage({ feedType }: FeedPageProps) {
  const { page } = useParams<{ page: string }>();
  const pageNum = page ? parseInt(page, 10) : 1;
  const listStart = (pageNum - 1) * 30 + 1;

  const { data: items, isLoading, error } = useQuery({
    queryKey: ['feed', feedType, pageNum],
    queryFn: () => fetchFeed(feedType, pageNum),
  });

  if (isLoading) return <Loader />;
  if (error) return <ErrorMessage message={`Could not load ${feedType} stories.`} />;

  return (
    <div className={styles.mainContent}>
      {feedType === 'jobs' && (
        <p className="job-header">
          These are jobs at startups that were funded by Y Combinator. You can also get a job at a
          YC startup through <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
        </p>
      )}
      {items && (
        <>
          <ol
            className={feedType !== 'jobs' ? styles.listMargin : undefined}
            start={listStart}
          >
            {items.map((item) => (
              <li key={item.id} className={styles.post}>
                <FeedItem item={item} />
              </li>
            ))}
          </ol>
          <div className="nav">
            {listStart !== 1 && (
              <Link to={`/${feedType}/${pageNum - 1}`} className={styles.prev}>
                ‹ Prev
              </Link>
            )}
            {items.length === 30 && (
              <Link to={`/${feedType}/${pageNum + 1}`} className={styles.more}>
                More ›
              </Link>
            )}
          </div>
        </>
      )}
    </div>
  );
}
