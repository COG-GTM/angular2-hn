import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchItemContent } from '../services/hackernews-api';
import { useSettings } from '../hooks/useSettings';
import { formatCommentCount } from '../utils/comment';
import type { Story } from '../types';
import Loader from './Loader';
import ErrorMessage from './ErrorMessage';
import CommentItem from './CommentItem';
import './ItemDetails.scss';

export default function ItemDetails() {
  const [item, setItem] = useState<Story | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { settings } = useSettings();

  useEffect(() => {
    if (!id) return;
    let ignore = false;
    setItem(null);
    setErrorMessage('');
    const itemID = parseInt(id, 10);
    fetchItemContent(itemID)
      .then(data => { if (!ignore) setItem(data); })
      .catch(() => { if (!ignore) setErrorMessage('Could not load item comments.'); });
    window.scrollTo(0, 0);
    return () => { ignore = true; };
  }, [id]);

  const goBack = () => {
    navigate(-1);
  };

  const hasUrl = item ? item.url && item.url.indexOf('http') === 0 : false;

  return (
    <div className="main-content">
      {!item && !errorMessage && <Loader />}
      {!item && errorMessage !== '' && <ErrorMessage message={errorMessage} />}

      {item && (
        <div className="item">
          <div className="mobile item-header">
            <p className="title-block">
              <span className="back-button" onClick={goBack}></span>
              {hasUrl ? (
                <a
                  className="title"
                  href={item.url}
                  target={settings.openLinkInNewTab ? '_blank' : undefined}
                  rel={settings.openLinkInNewTab ? 'noopener' : undefined}
                >
                  {item.title}
                </a>
              ) : (
                <Link className="title" to={`/item/${item.id}`}>
                  {item.title}
                </Link>
              )}
            </p>
          </div>
          <div
            className={`laptop${item.comments_count > 0 || item.type === 'job' ? ' item-header' : ''}${item.text ? ' head-margin' : ''}`}
          >
            {hasUrl ? (
              <p>
                <a
                  className="title"
                  href={item.url}
                  target={settings.openLinkInNewTab ? '_blank' : undefined}
                  rel={settings.openLinkInNewTab ? 'noopener' : undefined}
                >
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
              <span className={item.type !== 'job' ? 'item-details' : ''}>
                {item.time_ago}
                {item.type !== 'job' && (
                  <span> |{' '}
                    <Link to={`/item/${item.id}`}>
                      {formatCommentCount(item.comments_count)}
                    </Link>
                  </span>
                )}
              </span>
            </div>
          </div>
          {item.type === 'poll' && item.poll && (
            <div className="pollResults">
              {item.poll.map((pollResult, index) => (
                <div key={index} className="pollContent">
                  <div dangerouslySetInnerHTML={{ __html: pollResult.content }} />
                  <div className="subtext">{pollResult.points} points</div>
                  <div
                    className="pollBar"
                    style={{ width: (pollResult.points / item.poll_votes_count * 100) + '%' }}
                  />
                </div>
              ))}
            </div>
          )}
          {item.content && (
            <p className="subject" dangerouslySetInnerHTML={{ __html: item.content }} />
          )}
          <ul className="comment-list">
            {item.comments && item.comments.map(comment => (
              <li key={comment.id}>
                <CommentItem comment={comment} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
