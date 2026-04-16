import { useParams, useNavigate, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { useItemContent } from '../../hooks/useHackerNewsApi';
import { useSettings } from '../../hooks/useSettings';
import { Loader } from '../shared/Loader';
import { ErrorMessage } from '../shared/ErrorMessage';
import { Comment } from './Comment';
import { formatComment } from '../../utils/formatComment';
import styles from './ItemDetailsPage.module.scss';

export function ItemDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { item, error } = useItemContent(Number(id));

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const goBack = () => {
    navigate(-1);
  };

  const hasUrl = item ? item.url && item.url.indexOf('http') === 0 : false;

  return (
    <div className={styles['main-content']}>
      {!item && !error && <Loader />}
      {!item && error && <ErrorMessage message={error} />}

      {item && (
        <div className={styles.item}>
          <div className={`${styles.mobile} ${styles['item-header']}`}>
            <p className={styles['title-block']}>
              <span className={styles['back-button']} onClick={goBack}></span>
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
            className={`${styles.laptop} ${item.comments_count > 0 || item.type === 'job' ? styles['item-header'] : ''} ${item.text ? styles['head-margin'] : ''}`}
          >
            {hasUrl ? (
              <p>
                <a
                  className={styles.title}
                  href={item.url}
                  target={settings.openLinkInNewTab ? '_blank' : undefined}
                  rel={settings.openLinkInNewTab ? 'noopener' : undefined}
                >
                  {item.title}
                </a>
                {item.domain && <span className={styles.domain}> ({item.domain})</span>}
              </p>
            ) : (
              <p>
                <Link className={styles.title} to={`/item/${item.id}`}>
                  {item.title}
                </Link>
              </p>
            )}
            <div className={styles.subtext}>
              {item.type !== 'job' && (
                <span>
                  {item.points} points by <Link to={`/user/${item.user}`}>{item.user}</Link>
                </span>
              )}
              <span className={item.type !== 'job' ? styles['item-details-span'] : ''}>
                {item.time_ago}
                {item.type !== 'job' && (
                  <span>
                    {' '}
                    | <Link to={`/item/${item.id}`}>{formatComment(item.comments_count)}</Link>
                  </span>
                )}
              </span>
            </div>
          </div>
          {item.type === 'poll' && item.poll && (
            <div className={styles.pollResults}>
              {item.poll.map((pollResult, i) => (
                <div key={i} className={styles.pollContent}>
                  <div dangerouslySetInnerHTML={{ __html: pollResult.content }} />
                  <div className={styles.subtext}>{pollResult.points} points</div>
                  <div
                    className={styles.pollBar}
                    style={{ width: `${(pollResult.points / item.poll_votes_count) * 100}%` }}
                  ></div>
                </div>
              ))}
            </div>
          )}
          {item.content && <p className={styles.subject} dangerouslySetInnerHTML={{ __html: item.content }} />}
          <ul className={styles['comment-list']}>
            {item.comments &&
              item.comments.map((comment) => (
                <li key={comment.id}>
                  <Comment comment={comment} />
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}
