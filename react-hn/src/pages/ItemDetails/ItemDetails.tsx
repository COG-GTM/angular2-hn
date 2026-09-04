import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import Comment from '../../components/Comment/Comment';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import Loader from '../../components/Loader/Loader';
import { useSettings } from '../../contexts/SettingsContext';
import { Story } from '../../models/Story';
import { fetchItemContent } from '../../services/hackerNewsApi';
import { formatComment } from '../../utils/commentFormat';
import { sanitizeHtml } from '../../utils/sanitizeHtml';

import styles from './ItemDetails.module.scss';

const ItemDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const [item, setItem] = useState<Story | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    setItem(null);
    setErrorMessage('');
    window.scrollTo(0, 0);

    fetchItemContent(Number(id), controller.signal)
      .then(setItem)
      .catch(() => {
        if (!controller.signal.aborted) {
          setErrorMessage('Could not load item comments.');
        }
      });

    return () => controller.abort();
  }, [id]);

  const hasUrl = !!item && !!item.url && item.url.indexOf('http') === 0;
  const externalLinkProps = settings.openLinkInNewTab
    ? { target: '_blank', rel: 'noopener' }
    : {};

  return (
    <div className={styles.host}>
      {!item && !errorMessage && <Loader />}
      {!item && errorMessage !== '' && <ErrorMessage message={errorMessage} />}

      {item && (
        <div className="item">
          <div className="mobile item-header">
            <p className="title-block">
              <span className="back-button" onClick={() => navigate(-1)} />
              {hasUrl ? (
                <a className="title" href={item.url} {...externalLinkProps}>{item.title}</a>
              ) : (
                <Link className="title" to={`/item/${item.id}`}>{item.title}</Link>
              )}
            </p>
          </div>
          <div
            className={[
              'laptop',
              item.comments_count > 0 || item.type === 'job' ? 'item-header' : '',
              item.text ? 'head-margin' : ''
            ].filter(Boolean).join(' ')}
          >
            {hasUrl ? (
              <p className="title-row">
                <a className="title" href={item.url} {...externalLinkProps}>{item.title}</a>
                {item.domain && <span className="domain"> ({item.domain})</span>}
              </p>
            ) : (
              <p className="title-row">
                <Link className="title" to={`/item/${item.id}`}>{item.title}</Link>
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
                    {' | '}
                    <Link to={`/item/${item.id}`}>{formatComment(item.comments_count)}</Link>
                  </span>
                )}
              </span>
            </div>
          </div>
          {item.type === 'poll' && (
            <div className="pollResults">
              {(item.poll || []).map((pollResult, index) => (
                <div key={index} className="pollContent">
                  <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(pollResult.content) }} />
                  <div className="subtext">{pollResult.points} points</div>
                  <div
                    className="pollBar"
                    style={{ width: `${(pollResult.points / item.poll_votes_count) * 100}%` }}
                  />
                </div>
              ))}
            </div>
          )}
          <p className="subject" dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.content || '') }} />
          <ul className="comment-list">
            {(item.comments || []).map(comment => (
              <li key={comment.id}>
                <Comment comment={comment} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ItemDetails;
