import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchItemContent } from '../services/hackernews-api';
import { useSettings } from '../context/SettingsContext';
import { formatComment } from '../utils/formatComment';
import type { Story } from '../types/story';
import Loader from './shared/Loader';
import ErrorMessage from './shared/ErrorMessage';
import Comment from './Comment';
import styles from './ItemDetails.module.scss';

export default function ItemDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const [item, setItem] = useState<Story | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!id) return;
    setItem(null);
    setErrorMessage('');

    fetchItemContent(parseInt(id, 10))
      .then(data => setItem(data))
      .catch(() => setErrorMessage('Could not load item comments.'));

    window.scrollTo(0, 0);
  }, [id]);

  const goBack = () => navigate(-1);
  const hasUrl = item?.url && item.url.indexOf('http') === 0;

  return (
    <div className={styles.mainContent}>
      {!item && !errorMessage && <Loader />}
      {!item && errorMessage !== '' && <ErrorMessage message={errorMessage} />}

      {item && (
        <div className={styles.item}>
          <div className={`${styles.mobile} item-header ${styles.itemHeader}`}>
            <p className={styles.titleBlock}>
              <span className={`back-button ${styles.backButton}`} onClick={goBack}></span>
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
            className={`${styles.laptop} ${
              item.comments_count > 0 || item.type === 'job' ? `item-header ${styles.itemHeader}` : ''
            } ${item.text ? styles.headMargin : ''}`}
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
            <div className={`subtext ${styles.subtext}`}>
              {item.type !== 'job' && (
                <span>
                  {item.points} points by{' '}
                  <Link to={`/user/${item.user}`}>{item.user}</Link>
                </span>
              )}
              <span className={item.type !== 'job' ? styles.itemDetails : ''}>
                {item.time_ago}
                {item.type !== 'job' && (
                  <span> |{' '}
                    <Link to={`/item/${item.id}`}>
                      {formatComment(item.comments_count)}
                    </Link>
                  </span>
                )}
              </span>
            </div>
          </div>
          {item.type === 'poll' && item.poll && (
            <div className={styles.pollResults}>
              {item.poll.map((pollResult, index) => (
                <div key={index} className={styles.pollContent}>
                  <div dangerouslySetInnerHTML={{ __html: pollResult.content }} />
                  <div className={`subtext ${styles.subtext}`}>{pollResult.points} points</div>
                  <div
                    className="pollBar"
                    style={{ width: `${(pollResult.points / item.poll_votes_count) * 100}%` }}
                  ></div>
                </div>
              ))}
            </div>
          )}
          <p className={styles.subject} dangerouslySetInnerHTML={{ __html: item.content }} />
          <ul className="comment-list">
            {item.comments?.map(comment => (
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
