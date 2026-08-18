import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import Comment from './Comment/Comment';
import ErrorMessage from '../shared/components/ErrorMessage/ErrorMessage';
import Loader from '../shared/components/Loader/Loader';
import { fetchItemContent } from '../services/hackernews-api';
import { formatCommentCount } from '../utils/comment';
import { sanitizedHtml } from '../utils/html';
import { useSettings } from '../context/SettingsContext';
import type { Story } from '../models/story';
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
      .then(setItem)
      .catch((error: Error) => {
        if (error.name !== 'AbortError') {
          setErrorMessage('Could not load item comments.');
        }
      });

    window.scrollTo(0, 0);

    return () => controller.abort();
  }, [id]);

  const goBack = () => navigate(-1);

  if (!item) {
    return (
      <div className="main-content item-details-page">
        {!errorMessage && <Loader />}
        {errorMessage !== '' && <ErrorMessage message={errorMessage} />}
      </div>
    );
  }

  const hasUrl = item.url.indexOf('http') === 0;
  const linkTarget = settings.openLinkInNewTab ? '_blank' : undefined;
  const linkRel = settings.openLinkInNewTab ? 'noopener' : undefined;
  const laptopClassNames = ['laptop'];
  if (item.comments_count > 0 || item.type === 'job') {
    laptopClassNames.push('item-header');
  }
  if (item.text) {
    laptopClassNames.push('head-margin');
  }

  return (
    <div className="main-content item-details-page">
      <div className="item">
        <div className="mobile item-header">
          <p className="title-block">
            <span className="back-button" onClick={goBack}></span>
            {hasUrl ? (
              <a className="title" href={item.url} target={linkTarget} rel={linkRel}>
                {item.title}
              </a>
            ) : (
              <Link className="title" to={`/item/${item.id}`}>
                {item.title}
              </Link>
            )}
          </p>
        </div>
        <div className={laptopClassNames.join(' ')}>
          {hasUrl ? (
            <p>
              <a className="title" href={item.url} target={linkTarget} rel={linkRel}>
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
                  | <Link to={`/item/${item.id}`}>{formatCommentCount(item.comments_count)}</Link>
                </span>
              )}
            </span>
          </div>
        </div>
        {item.type === 'poll' && (
          <div className="pollResults">
            {item.poll.map((pollResult, index) => (
              <div key={index} className="pollContent">
                <div dangerouslySetInnerHTML={sanitizedHtml(pollResult.content)}></div>
                <div className="subtext">{pollResult.points} points</div>
                <div
                  className="pollBar"
                  style={{ width: (pollResult.points / item.poll_votes_count) * 100 + '%' }}
                ></div>
              </div>
            ))}
          </div>
        )}
        <p className="subject" dangerouslySetInnerHTML={sanitizedHtml(item.content)}></p>
        <ul className="comment-list">
          {item.comments?.map((comment) => (
            <li key={comment.id}>
              <Comment comment={comment} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
