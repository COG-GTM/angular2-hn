import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Story } from '../../models';
import { useHackerNewsAPI } from '../../hooks/useHackerNewsAPI';
import { useSettings } from '../../context/SettingsContext';
import { Loader, ErrorMessage } from '../shared';
import { formatCommentCount } from '../../utils/formatters';
import Comment from './Comment';
import './ItemDetails.scss';

const ItemDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const { fetchItemContent } = useHackerNewsAPI();
  const { settings } = useSettings();

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    setErrorMessage('');
    setItem(null);

    fetchItemContent(parseInt(id, 10))
      .then((data) => {
        setItem(data);
        setLoading(false);
        window.scrollTo(0, 0);
      })
      .catch(() => {
        setErrorMessage('Could not load item comments.');
        setLoading(false);
      });
  }, [id, fetchItemContent]);

  const goBack = () => {
    navigate(-1);
  };

  const hasUrl = item?.url && item.url.indexOf('http') === 0;

  if (loading) {
    return (
      <div className="main-content">
        <Loader />
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="main-content">
        <ErrorMessage message={errorMessage} />
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
              <a
                className="title"
                href={item.url}
                target={settings.openLinkInNewTab ? '_blank' : undefined}
                rel={settings.openLinkInNewTab ? 'noopener noreferrer' : undefined}
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
                rel={settings.openLinkInNewTab ? 'noopener noreferrer' : undefined}
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
            <span className={item.type !== 'job' ? 'item-details' : ''}>
              {item.time_ago}
              {item.type !== 'job' && (
                <span>
                  {' '}
                  | <Link to={`/item/${item.id}`}>{formatCommentCount(item.comments_count)}</Link>
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
                  style={{ width: `${(pollResult.points / item.poll_votes_count) * 100}%` }}
                />
              </div>
            ))}
          </div>
        )}
        {item.content && <p className="subject" dangerouslySetInnerHTML={{ __html: item.content }} />}
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

export default ItemDetails;
