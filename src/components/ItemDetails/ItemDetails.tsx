import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useItemContent } from '../../hooks/useHackerNewsApi';
import { useSettings } from '../../contexts/SettingsContext';
import { formatComment } from '../../utils/formatComment';
import { sanitizeHtml } from '../../utils/sanitize';
import Loader from '../Loader/Loader';
import ErrorMessage from '../ErrorMessage/ErrorMessage';
import CommentComponent from '../Comment/Comment';
import './ItemDetails.scss';

function ItemDetails() {
  const { id } = useParams<{ id: string }>();
  const itemId = id ? parseInt(id, 10) : 0;
  const { item, error } = useItemContent(itemId);
  const { settings } = useSettings();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [itemId]);

  const hasUrl = item?.url && item.url.indexOf('http') === 0;

  return (
    <div className="main-content">
      {!item && !error && <Loader />}
      {!item && error && <ErrorMessage message={error} />}

      {item && (
        <div className="item">
          <div className="mobile item-header">
            <p className="title-block">
              <span className="back-button" onClick={() => navigate(-1)}></span>
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
            className={`laptop ${item.comments_count > 0 || item.type === 'job' ? 'item-header' : ''} ${item.content ? 'head-margin' : ''}`}
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
                    {' '}|{' '}
                    <Link to={`/item/${item.id}`}>{formatComment(item.comments_count)}</Link>
                  </span>
                )}
              </span>
            </div>
          </div>
          {item.type === 'poll' && item.poll && (
            <div className="poll-results">
              {item.poll.map((pollResult, index) => (
                <div key={index} className="poll-content">
                  <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(pollResult.content) }} />
                  <div className="subtext">{pollResult.points} points</div>
                  <div
                    className="poll-bar"
                    style={{ width: `${(pollResult.points / item.poll_votes_count) * 100}%` }}
                  />
                </div>
              ))}
            </div>
          )}
          {item.content && (
            <p
              className="subject"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.content) }}
            />
          )}
          {item.comments && (
            <ul className="comment-list">
              {item.comments.map(comment => (
                <li key={comment.id}>
                  <CommentComponent comment={comment} />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default ItemDetails;
