import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSettings } from '../shared/hooks/useSettings';
import { Story } from '../shared/models/story';
import { Comment as CommentComponent } from './comment/Comment';
import { Loader } from '../shared/components/Loader';
import { ErrorMessage } from '../shared/components/ErrorMessage';
import { formatCommentCount } from '../shared/utils/formatCommentCount';
import styles from './ItemDetails.module.scss';

export function ItemDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const [item, setItem] = useState<Story | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    if (id) {
      fetch(`https://node-hnapi.herokuapp.com/item/${id}`, {
        signal: controller.signal,
      })
        .then((res) => res.json())
        .then((story: Story) => {
          if (story.type === 'poll' && story.poll) {
            const numberOfPollOptions = story.poll.length;
            let pollVotesCount = 0;
            const pollPromises = Array.from(
              { length: numberOfPollOptions },
              (_, i) =>
                fetch(
                  `https://node-hnapi.herokuapp.com/item/${story.id + i + 1}`,
                  { signal: controller.signal }
                ).then((res) => res.json())
            );
            Promise.all(pollPromises).then((pollResults) => {
              pollResults.forEach((result, i) => {
                story.poll[i] = result;
                pollVotesCount += result.points;
              });
              story.poll_votes_count = pollVotesCount;
              setItem({ ...story });
            }).catch((err) => {
              if (err.name !== 'AbortError') {
                setErrorMessage('Could not load item comments.');
              }
            });
          } else {
            setItem(story);
          }
        })
        .catch((err) => {
          if (err.name !== 'AbortError') {
            setErrorMessage('Could not load item comments.');
          }
        });
    }

    window.scrollTo(0, 0);

    return () => {
      controller.abort();
    };
  }, [id]);

  const hasUrl = item?.url?.startsWith('http') ?? false;
  const goBack = () => navigate(-1);

  const linkTarget = settings.openLinkInNewTab ? '_blank' : undefined;
  const linkRel = settings.openLinkInNewTab ? 'noopener' : undefined;

  return (
    <div className={styles.mainContent}>
      {!item && !errorMessage && <Loader />}
      {!item && errorMessage !== '' && <ErrorMessage message={errorMessage} />}

      {item && (
        <div className={styles.item}>
          {/* Mobile header */}
          <div className={`${styles.mobile} ${styles.itemHeader}`}>
            <p className={styles.titleBlock}>
              <span className={styles.backButton} onClick={goBack} />
              {hasUrl ? (
                <a
                  className={styles.title}
                  href={item.url}
                  target={linkTarget}
                  rel={linkRel}
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

          {/* Laptop header */}
          <div
            className={`${styles.laptop}${
              item.comments_count > 0 || item.type === 'job'
                ? ` ${styles.itemHeader}`
                : ''
            }${item.content ? ` ${styles.headMargin}` : ''}`}
          >
            {hasUrl ? (
              <p>
                <a
                  className={styles.title}
                  href={item.url}
                  target={linkTarget}
                  rel={linkRel}
                >
                  {item.title}
                </a>
                {item.domain && (
                  <span className={styles.domain}> ({item.domain})</span>
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
                className={item.type !== 'job' ? styles.itemDetails : undefined}
              >
                {item.time_ago}
                {item.type !== 'job' && (
                  <span>
                    {' '}
                    |{' '}
                    <Link to={`/item/${item.id}`}>
                      {formatCommentCount(item.comments_count)}
                    </Link>
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Poll results */}
          {item.type === 'poll' && item.poll && (
            <div className={styles.pollResults}>
              {item.poll.map((pollResult, index) => (
                <div key={index} className={styles.pollContent}>
                  <div
                    dangerouslySetInnerHTML={{ __html: pollResult.content }}
                  />
                  <div className={styles.subtext}>
                    {pollResult.points} points
                  </div>
                  <div
                    className={styles.pollBar}
                    style={{
                      width: `${
                        item.poll_votes_count > 0 ? (pollResult.points / item.poll_votes_count) * 100 : 0
                      }%`,
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Content */}
          {item.content && (
            <p
              className={styles.subject}
              dangerouslySetInnerHTML={{ __html: item.content }}
            />
          )}

          {/* Comments */}
          <ul className={styles.commentList}>
            {item.comments?.map((comment) => (
              <li key={comment.id}>
                <CommentComponent comment={comment} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
