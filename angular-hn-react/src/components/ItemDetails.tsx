import React, { useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useItem } from '../hooks/useHackerNewsAPI';
import { useSettings } from '../contexts/SettingsContext';
import { Comment } from './Comment';
import { Loader } from './Loader';
import { ErrorMessage } from './ErrorMessage';
import './ItemDetails.css';

export const ItemDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const itemId = id ? parseInt(id, 10) : 0;
  const { item, loading, error } = useItem(itemId);
  const { settings } = useSettings();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [itemId]);

  const goBack = () => {
    navigate(-1);
  };

  const hasUrl = item?.url && item.url.indexOf('http') === 0;

  const linkProps = settings.openLinkInNewTab
    ? { target: '_blank' as const, rel: 'noopener' }
    : {};

  if (loading) {
    return (
      <div className="main-content">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="main-content">
        <ErrorMessage message={error} />
      </div>
    );
  }

  if (!item) {
    return null;
  }

  return (
    <div className="main-content">
      <div className="item">
        <div className="mobile item-header">
          <p className="title-block">
            <span className="back-button" onClick={goBack}></span>
            {hasUrl ? (
              <a className="title" href={item.url} {...linkProps}>
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
          className={`laptop ${
            (item.comments_count && item.comments_count > 0) || item.type === 'job'
              ? 'item-header'
              : ''
          } ${item.content ? 'head-margin' : ''}`}
        >
          {hasUrl ? (
            <p>
              <a className="title" href={item.url} {...linkProps}>
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
                <span>
                  {' '}|{' '}
                  <Link to={`/item/${item.id}`}>
                    {formatComments(item.comments_count)}
                  </Link>
                </span>
              )}
            </span>
          </div>
        </div>
        {item.type === 'poll' && item.poll && (
          <div className="pollResults">
            {item.poll.map((pollResult) => (
              <div key={pollResult.id} className="pollContent">
                <div dangerouslySetInnerHTML={{ __html: pollResult.content || '' }} />
                <div className="subtext">{pollResult.points} points</div>
                <div
                  className="pollBar"
                  style={{
                    width: `${
                      item.poll_votes_count
                        ? (pollResult.points / item.poll_votes_count) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            ))}
          </div>
        )}
        {item.content && (
          <p
            className="subject"
            dangerouslySetInnerHTML={{ __html: item.content }}
          />
        )}
        {item.comments && item.comments.length > 0 && (
          <ul className="comment-list">
            {item.comments.map((comment) => (
              <li key={comment.id}>
                <Comment comment={comment} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

function formatComments(count?: number): string {
  if (count === undefined || count === 0) {
    return 'discuss';
  }
  if (count === 1) {
    return '1 comment';
  }
  return `${count} comments`;
}
