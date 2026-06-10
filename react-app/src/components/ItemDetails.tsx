import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import type { Story } from '../models';
import { fetchItemContent } from '../services/hackernewsApi';
import { useSettings } from '../context/SettingsContext';
import { commentCount } from '../utils/comment';
import { sanitizeHtml } from '../utils/sanitize';
import { Comment } from './Comment';
import { Loader } from './Loader';
import { ErrorMessage } from './ErrorMessage';
import './ItemDetails.scss';

export function ItemDetails() {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { settings } = useSettings();

  const [item, setItem] = useState<Story | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    setItem(undefined);
    setErrorMessage('');

    const itemID = Number(params.id);
    fetchItemContent(itemID, controller.signal)
      .then((data) => setItem(data))
      .catch((error: unknown) => {
        if ((error as Error)?.name === 'AbortError') {
          return;
        }
        setErrorMessage('Could not load item comments.');
      });

    window.scrollTo(0, 0);
    return () => controller.abort();
  }, [params.id]);

  const goBack = () => navigate(-1);

  const hasUrl = item ? (item.url ?? '').indexOf('http') === 0 : false;
  const externalLinkProps = settings.openLinkInNewTab ? { target: '_blank', rel: 'noopener' } : {};

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
                <a className="title" href={item.url} {...externalLinkProps}>
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
            className={
              'laptop' +
              (item.comments_count > 0 || item.type === 'job' ? ' item-header' : '') +
              (item.text ? ' head-margin' : '')
            }
          >
            {hasUrl ? (
              <p>
                <a className="title" href={item.url} {...externalLinkProps}>
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
                    {' '}
                    | <Link to={`/item/${item.id}`}>{commentCount(item.comments_count)}</Link>
                  </span>
                )}
              </span>
            </div>
          </div>
          {item.type === 'poll' && (
            <div className="pollResults">
              {item.poll?.map((pollResult, index) => (
                <div className="pollContent" key={index}>
                  <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(pollResult.content) }}></div>
                  <div className="subtext">{pollResult.points} points</div>
                  <div
                    className="pollBar"
                    style={{ width: (pollResult.points / item.poll_votes_count) * 100 + '%' }}
                  ></div>
                </div>
              ))}
            </div>
          )}
          <p className="subject" dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.content) }}></p>
          <ul className="comment-list">
            {item.comments?.map((comment) => (
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
