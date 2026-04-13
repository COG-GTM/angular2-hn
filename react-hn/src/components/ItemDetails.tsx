import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Story } from '../models/story';
import { fetchItemContent } from '../services/hackernews-api';
import { useSettings } from '../context/SettingsContext';
import { formatCommentCount } from '../utils/formatComments';
import Comment from './Comment';
import Loader from './Loader';
import ErrorMessage from './ErrorMessage';
import './ItemDetails.scss';

const ItemDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const [item, setItem] = useState<Story | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setItem(null);
    setErrorMessage('');
    if (id) {
      fetchItemContent(parseInt(id, 10))
        .then(data => {
          setItem(data);
        })
        .catch(() => {
          setErrorMessage('Could not load item comments.');
        });
    }
    window.scrollTo(0, 0);
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
                  rel={settings.openLinkInNewTab ? 'noreferrer' : undefined}
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
            className={`laptop${item.comments_count > 0 || item.type === 'job' ? ' item-header' : ''}${item.content ? ' head-margin' : ''}`}
          >
            {hasUrl ? (
              <p>
                <a
                  className="title"
                  href={item.url}
                  target={settings.openLinkInNewTab ? '_blank' : undefined}
                  rel={settings.openLinkInNewTab ? 'noreferrer' : undefined}
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
                    style={{ width: `${(pollResult.points / item.poll_votes_count) * 100}%` }}
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
              {item.comments.map((comment) => (
                <li key={comment.id}>
                  <Comment comment={comment} />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default ItemDetails;
