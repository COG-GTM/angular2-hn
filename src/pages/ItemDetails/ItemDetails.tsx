import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { fetchItemContent } from '../../api/hackernews';
import { Story } from '../../models/story';
import { useSettings } from '../../contexts/SettingsContext';
import { commentText } from '../../utils/comment';
import { sanitize } from '../../utils/sanitize';
import Comment from './Comment';
import Loader from '../../components/Loader/Loader';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import './item-details.scss';

export default function ItemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const [item, setItem] = useState<Story | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    setItem(null);
    setErrorMessage('');
    fetchItemContent(Number(id), controller.signal)
      .then((story) => setItem(story))
      .catch((error: Error) => {
        if (error.name !== 'AbortError') {
          setErrorMessage('Could not load item comments.');
        }
      });
    window.scrollTo(0, 0);
    return () => controller.abort();
  }, [id]);

  const goBack = () => navigate(-1);
  const hasUrl = item?.url ? item.url.indexOf('http') === 0 : false;

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
            className={[
              'laptop',
              item.comments_count > 0 || item.type === 'job' ? 'item-header' : '',
              item.text ? 'head-margin' : '',
            ]
              .filter(Boolean)
              .join(' ')}
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
                  {item.points} points by <Link to={`/user/${item.user}`}>{item.user}</Link>
                </span>
              )}
              <span className={item.type !== 'job' ? 'item-details' : undefined}>
                {item.time_ago}
                {item.type !== 'job' && (
                  <span>
                    {' '}| <Link to={`/item/${item.id}`}>{commentText(item.comments_count)}</Link>
                  </span>
                )}
              </span>
            </div>
          </div>
          {item.type === 'poll' && item.poll && (
            <div className="pollResults">
              {item.poll.map((pollResult, index) => (
                <div key={index} className="pollContent">
                  <div dangerouslySetInnerHTML={{ __html: sanitize(pollResult.content) }}></div>
                  <div className="subtext">{pollResult.points} points</div>
                  <div
                    className="pollBar"
                    style={{ width: `${(pollResult.points / (item.poll_votes_count || 1)) * 100}%` }}
                  ></div>
                </div>
              ))}
            </div>
          )}
          {item.content && <p className="subject" dangerouslySetInnerHTML={{ __html: sanitize(item.content) }}></p>}
          <ul className="comment-list">
            {(item.comments ?? []).map((comment) => (
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
