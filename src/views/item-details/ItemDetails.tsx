import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';
import { Story } from '../../models/story';
import { fetchItemContent } from '../../services/hackerNewsApi';
import { formatCommentCount } from '../../utils/comment';
import ErrorMessage from '../../components/shared/ErrorMessage';
import Loader from '../../components/shared/Loader';
import { sanitizeHtml } from '../../utils/sanitize';
import Comment from './Comment';
import './ItemDetails.scss';

export default function ItemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const [item, setItem] = useState<Story>();
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;
    setItem(undefined);
    setError('');
    window.scrollTo(0, 0);
    fetchItemContent(+(id ?? '0'))
      .then((nextItem) => {
        if (!ignore) {
          setItem(nextItem);
        }
      })
      .catch(() => {
        if (!ignore) {
          setError('Could not load item comments.');
        }
      });
    return () => {
      ignore = true;
    };
  }, [id]);

  const hasUrl = (item?.url ?? '').startsWith('http');
  const goBack = () => navigate(-1);

  return (
    <div className="main-content app-item-details">
      {!item && !error && <Loader />}
      {!item && error && <ErrorMessage message={error} />}
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
                <Link className="title" to={`/item/${item.id}`}>{item.title}</Link>
              )}
            </p>
          </div>
          <div className={`laptop${item.comments_count > 0 || item.type === 'job' ? ' item-header' : ''}${item.content ? ' head-margin' : ''}`}>
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
              <p><Link className="title" to={`/item/${item.id}`}>{item.title}</Link></p>
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
                  <span> | <Link to={`/item/${item.id}`}>{formatCommentCount(item.comments_count)}</Link></span>
                )}
              </span>
            </div>
          </div>
          {item.type === 'poll' && (
            <div className="pollResults">
              {item.poll.map((pollResult, index) => (
                <div className="pollContent" key={index}>
                  <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(pollResult.content) }} />
                  <div className="subtext">{pollResult.points} points</div>
                  <div className="pollBar" style={{ width: `${pollResult.points / item.poll_votes_count * 100}%` }} />
                </div>
              ))}
            </div>
          )}
          <p className="subject" dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.content) }} />
          <ul className="comment-list">
            {item.comments.map((comment) => (
              <li key={comment.id}><Comment comment={comment} /></li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
