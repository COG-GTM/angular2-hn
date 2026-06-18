import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { useItemDetails } from '../../shared/hooks/useHackerNewsApi';
import { useSettings } from '../../shared/context/SettingsContext';
import { Loader, ErrorMessage } from '../../shared/components';
import styles from '../../styles/ItemDetailsPage.module.css';
import Comment from './Comment';

function formatComments(count: number): string {
  if (count > 0) {
    return `${count} ${count === 1 ? 'comment' : 'comments'}`;
  }
  return 'discuss';
}

export default function ItemDetailsPage() {
  const { id: idParam } = useParams();
  const id = Number(idParam);
  const { item, error, loading } = useItemDetails(id);
  const { settings } = useSettings();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const goBack = () => navigate(-1);

  const hasUrl = item?.url ? item.url.startsWith('http') : false;

  const laptopClassName = [
    styles.laptop,
    item && (item.comments_count > 0 || item.type === 'job')
      ? styles['item-header']
      : undefined,
    item?.text ? styles['head-margin'] : undefined,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={styles['main-content']}>
      {loading ? (
        <Loader />
      ) : error ? (
        <ErrorMessage errorMessage={error} />
      ) : item ? (
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
          <div className={laptopClassName}>
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
                {item.domain && (
                  <span className={styles.domain}>({item.domain})</span>
                )}
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
                  {item.points} points by{' '}
                  <Link to={`/user/${item.user}`}>{item.user}</Link>
                </span>
              )}
              <span
                className={item.type !== 'job' ? styles['item-details'] : undefined}
              >
                {item.time_ago}
                {item.type !== 'job' && (
                  <span>
                    {' '}
                    |{' '}
                    <Link to={`/item/${item.id}`}>
                      {formatComments(item.comments_count)}
                    </Link>
                  </span>
                )}
              </span>
            </div>
          </div>
          {item.type === 'poll' && (
            <div className={styles.pollResults}>
              {item.poll.map((pollResult, index) => (
                <div key={index} className={styles.pollContent}>
                  <div
                    dangerouslySetInnerHTML={{ __html: pollResult.content }}
                  />
                  <div className={styles.subtext}>{pollResult.points} points</div>
                  <div
                    className={styles.pollBar}
                    style={{
                      width: `${(pollResult.points / item.poll_votes_count) * 100}%`,
                    }}
                  />
                </div>
              ))}
            </div>
          )}
          <p
            className={styles.subject}
            dangerouslySetInnerHTML={{ __html: item.content ?? '' }}
          />
          <ul>
            {item.comments.map((comment) => (
              <li key={comment.id}>
                <Comment comment={comment} />
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
