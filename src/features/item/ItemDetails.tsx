import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { Story } from '../../types';
import { fetchItemContent } from '../../services/hackerNewsApi';
import { useSettings } from '../../context/SettingsContext';
import { Loader } from '../../components/Loader/Loader';
import { ErrorMessage } from '../../components/ErrorMessage/ErrorMessage';
import { commentLabel } from '../../utils/comment';
import { Comment } from './Comment';
import './ItemDetails.scss';

// The node-hnapi item response carries an HTML `content` body that the shared
// `Story` type does not declare; augment locally rather than editing shared types.
type ItemStory = Story & { content?: string };

export function ItemDetails() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const navigate = useNavigate();
  const { settings } = useSettings();

  const [item, setItem] = useState<ItemStory | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let cancelled = false;
    setItem(null);
    setErrorMessage('');

    fetchItemContent(id)
      .then((story) => {
        if (!cancelled) {
          setItem(story);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setErrorMessage('Could not load item comments.');
        }
      });

    window.scrollTo(0, 0);

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (!item && errorMessage) {
    return (
      <div className="main-content">
        <ErrorMessage message={errorMessage} />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="main-content">
        <Loader />
      </div>
    );
  }

  const hasUrl = item.url.indexOf('http') === 0;
  const linkTarget = settings.openLinkInNewTab ? '_blank' : undefined;
  const linkRel = settings.openLinkInNewTab ? 'noopener' : undefined;
  const laptopClassName = [
    'laptop',
    item.comments_count > 0 || item.type === 'job' ? 'item-header' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="main-content">
      <div className="item">
        <div className="mobile item-header">
          <p className="title-block">
            <span className="back-button" onClick={() => navigate(-1)}></span>
            {hasUrl ? (
              <a className="title" href={item.url} target={linkTarget} rel={linkRel}>
                {item.title}
              </a>
            ) : (
              <Link className="title" to={`/item/${item.id}`}>
                {item.title}
              </Link>
            )}
          </p>
        </div>
        <div className={laptopClassName}>
          {hasUrl ? (
            <p>
              <a className="title" href={item.url} target={linkTarget} rel={linkRel}>
                {item.title}
              </a>
              {item.domain && <span className="domain">({item.domain})</span>}
            </p>
          ) : (
            <p>
              <Link className="title" to={`/item/${item.id}`}>
                {item.title}
              </Link>
            </p>
          )}
          <div className="subtext">
            {item.type !== 'job' && (
              <span>
                {item.points} points by{' '}
                <Link to={`/user/${item.user}`}>{item.user}</Link>
              </span>
            )}
            <span className={item.type !== 'job' ? 'item-details' : undefined}>
              {item.time_ago}
              {item.type !== 'job' && (
                <span>
                  {' '}
                  |{' '}
                  <Link to={`/item/${item.id}`}>{commentLabel(item.comments_count)}</Link>
                </span>
              )}
            </span>
          </div>
        </div>
        {item.type === 'poll' && Array.isArray(item.poll) && (
          <div className="pollResults">
            {item.poll.map((pollResult, index) => (
              <div key={index} className="pollContent">
                <div dangerouslySetInnerHTML={{ __html: pollResult.content }}></div>
                <div className="subtext">{pollResult.points} points</div>
                <div
                  className="pollBar"
                  style={{
                    width: `${
                      item.poll_votes_count > 0
                        ? (pollResult.points / item.poll_votes_count) * 100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            ))}
          </div>
        )}
        <p className="subject" dangerouslySetInnerHTML={{ __html: item.content ?? '' }}></p>
        <ul className="comment-list">
          {item.comments.map((comment) => (
            <li key={comment.id}>
              <Comment comment={comment} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
