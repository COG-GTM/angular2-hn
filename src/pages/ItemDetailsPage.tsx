import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchItemContent } from '@/services/hackernews-api';
import { useSettings } from '@/contexts/SettingsContext';
import { Loader } from '@/components/Loader';
import { ErrorMessage } from '@/components/ErrorMessage';
import type { Comment as CommentType } from '@/types';
import styles from './ItemDetailsPage.module.scss';

function formatComments(count: number): string {
  if (count > 0) {
    return count === 1 ? '1 comment' : `${count} comments`;
  }
  return 'discuss';
}

function CommentItem({ comment }: { comment: CommentType }) {
  if (comment.deleted) {
    return (
      <div>
        <div className="deleted-meta">
          <span>[deleted]</span> | Comment Deleted
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="meta">
        <Link to={`/user/${comment.user}`}>{comment.user}</Link>
        <span className={styles.time}> {comment.time_ago}</span>
      </div>
      <div className={styles.commentTree}>
        <p className={styles.commentText} dangerouslySetInnerHTML={{ __html: comment.content }} />
        {comment.comments.length > 0 && (
          <ul className={styles.subtree}>
            {comment.comments.map((child) => (
              <li key={child.id}>
                <CommentItem comment={child} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export function ItemDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { settings } = useSettings();

  const itemId = id ? parseInt(id, 10) : 0;

  const { data: item, isLoading, error } = useQuery({
    queryKey: ['item', itemId],
    queryFn: () => fetchItemContent(itemId),
    enabled: itemId > 0,
  });

  if (isLoading) return <Loader />;
  if (error) return <ErrorMessage message="Could not load item comments." />;
  if (!item) return null;

  const hasUrl = item.url.startsWith('http');

  return (
    <div className={styles.mainContent}>
      <div className={styles.item}>
        <div className={`mobile ${styles.itemHeader}`}>
          <p className={styles.titleBlock}>
            <span className="back-button" onClick={() => navigate(-1)} />
            {hasUrl ? (
              <a
                className={styles.title}
                href={item.url}
                target={settings.openLinkInNewTab ? '_blank' : undefined}
                rel={settings.openLinkInNewTab ? 'noopener' : undefined}
              >
                {item.title}
              </a>
            ) : (
              <Link className={styles.title} to={`/item/${item.id}`}>
                {item.title}
              </Link>
            )}
          </p>
        </div>
        <div
          className={`laptop ${
            item.comments_count > 0 || item.type === 'job' ? 'item-header' : ''
          } ${item.content ? styles.headMargin : ''}`}
        >
          <p>
            {hasUrl ? (
              <>
                <a
                  className={styles.title}
                  href={item.url}
                  target={settings.openLinkInNewTab ? '_blank' : undefined}
                  rel={settings.openLinkInNewTab ? 'noopener' : undefined}
                >
                  {item.title}
                </a>
                {item.domain && <span className="domain"> ({item.domain})</span>}
              </>
            ) : (
              <Link className={styles.title} to={`/item/${item.id}`}>
                {item.title}
              </Link>
            )}
          </p>
          <div className="subtext">
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
        {item.type === 'poll' && item.poll.length > 0 && (
          <div className={styles.pollResults}>
            {item.poll.map((pollResult, i) => (
              <div key={i} className="pollContent">
                <div dangerouslySetInnerHTML={{ __html: pollResult.content }} />
                <div className="subtext">{pollResult.points} points</div>
                <div
                  className="pollBar"
                  style={{
                    width: `${(pollResult.points / item.poll_votes_count) * 100}%`,
                  }}
                />
              </div>
            ))}
          </div>
        )}
        {item.content && (
          <p className={styles.subject} dangerouslySetInnerHTML={{ __html: item.content }} />
        )}
        {item.comments.length > 0 && (
          <ul className={styles.commentList}>
            {item.comments.map((comment) => (
              <li key={comment.id}>
                <CommentItem comment={comment} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
