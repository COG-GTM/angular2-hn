import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { fetchItemContent } from '../api/hnApi';
import Comment from '../components/Comment';
import ErrorMessage from '../components/ErrorMessage';
import Loader from '../components/Loader';
import { useSettings } from '../context/SettingsContext';
import type { Story } from '../types';
import { commentLabel } from '../utils/commentLabel';
import './ItemDetails.scss';

export default function ItemDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { openLinkInNewTab } = useSettings();

  const [item, setItem] = useState<Story | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    setItem(undefined);
    setErrorMessage('');

    fetchItemContent(Number(id), controller.signal)
      .then((data) => setItem(data))
      .catch((error) => {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }
        setErrorMessage('Could not load item comments.');
      });

    window.scrollTo(0, 0);

    return () => controller.abort();
  }, [id]);

  const goBack = () => navigate(-1);

  const hasUrl = !!item && typeof item.url === 'string' && item.url.indexOf('http') === 0;

  const laptopClassName = item
    ? ['laptop', item.comments_count > 0 || item.type === 'job' ? 'item-header' : '', item.text ? 'head-margin' : '']
        .filter(Boolean)
        .join(' ')
    : 'laptop';

  return (
    <div className="main-content item-detail">
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
                  target={openLinkInNewTab ? '_blank' : undefined}
                  rel={openLinkInNewTab ? 'noopener' : undefined}
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
          <div className={laptopClassName}>
            {hasUrl ? (
              <p>
                <a
                  className="title"
                  href={item.url}
                  target={openLinkInNewTab ? '_blank' : undefined}
                  rel={openLinkInNewTab ? 'noopener' : undefined}
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
                {' '}
                {item.time_ago}
                {item.type !== 'job' && (
                  <span>
                    {' '}
                    | <Link to={`/item/${item.id}`}>{commentLabel(item.comments_count)}</Link>
                  </span>
                )}
              </span>
            </div>
          </div>
          {item.type === 'poll' && item.poll && (
            <div className="pollResults">
              {item.poll.map((pollResult, index) => (
                <div key={index} className="pollContent">
                  <div dangerouslySetInnerHTML={{ __html: pollResult.content }}></div>
                  <div className="subtext">{pollResult.points} points</div>
                  <div
                    className="pollBar"
                    style={{ width: `${(pollResult.points / item.poll_votes_count) * 100}%` }}
                  ></div>
                </div>
              ))}
            </div>
          )}
          <p className="subject" dangerouslySetInnerHTML={{ __html: item.content ?? '' }}></p>
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
