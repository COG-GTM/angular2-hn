import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import type { Story } from '../../types';
import { fetchItemContent } from '../../services/hackernews-api';
import { useSettings } from '../../context/SettingsContext';
import { commentFormat } from '../../utils/commentFormat';
import { Loader } from '../../components/Loader/Loader';
import { ErrorMessage } from '../../components/ErrorMessage/ErrorMessage';
import { CommentItem } from '../../components/Comment/Comment';
import './ItemDetails.scss';

export function ItemDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const [item, setItem] = useState<Story | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    setItem(null);
    setErrorMessage('');

    if (id) {
      fetchItemContent(parseInt(id, 10), controller.signal)
        .then(data => {
          if (!cancelled) setItem(data);
        })
        .catch(err => {
          if (!cancelled && err.name !== 'AbortError') {
            setErrorMessage('Could not load item comments.');
          }
        });
    }

    window.scrollTo(0, 0);

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [id]);

  const goBack = () => navigate(-1);
  const hasUrl = item ? item.url && item.url.indexOf('http') === 0 : false;

  if (!item && !errorMessage) return <div className="main-content"><Loader /></div>;
  if (!item && errorMessage) return <div className="main-content"><ErrorMessage message={errorMessage} /></div>;
  if (!item) return null;

  return (
    <div className="main-content">
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
          className={`laptop${
            item.comments_count > 0 || item.type === 'job' ? ' item-header' : ''
          }${item.content ? ' head-margin' : ''}`}
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
            <span className={item.type !== 'job' ? 'item-details' : undefined}>
              {item.time_ago}
              {item.type !== 'job' && (
                <span>
                  {' '}
                  | <Link to={`/item/${item.id}`}>{commentFormat(item.comments_count)}</Link>
                </span>
              )}
            </span>
          </div>
        </div>
        {item.type === 'poll' && item.poll && (
          <div className="pollResults">
            {item.poll.map((pollResult, idx) => (
              <div key={idx} className="pollContent">
                <div dangerouslySetInnerHTML={{ __html: pollResult.content }} />
                <div className="subtext">{pollResult.points} points</div>
                <div
                  className="pollBar"
                  style={{
                    width: `${item.poll_votes_count > 0 ? (pollResult.points / item.poll_votes_count) * 100 : 0}%`,
                  }}
                />
              </div>
            ))}
          </div>
        )}
        {item.content && (
          <p className="subject" dangerouslySetInnerHTML={{ __html: item.content }} />
        )}
        {item.comments && item.comments.length > 0 && (
          <ul className="comment-list">
            {item.comments.map(comment => (
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
