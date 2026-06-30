import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import Comment from '../components/Comment';

import { fetchItemContent } from '../services/hackerNewsApi';
import { useSettings } from '../contexts/SettingsContext';
import { commentPipe } from '../utils/commentPipe';
import { Story } from '../models/story';

import './ItemDetails.scss';

type StoryWithContent = Story & { content?: string };

function ItemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { settings } = useSettings();

  const [item, setItem] = useState<StoryWithContent | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let cancelled = false;
    setItem(null);
    setErrorMessage('');
    fetchItemContent(Number(id))
      .then(data => {
        if (!cancelled) setItem(data);
      })
      .catch(() => {
        if (!cancelled) setErrorMessage('Could not load item comments.');
      });
    window.scrollTo(0, 0);
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (!item && !errorMessage) {
    return (
      <div className="main-content">
        <Loader />
      </div>
    );
  }

  if (!item && errorMessage) {
    return (
      <div className="main-content">
        <ErrorMessage message={errorMessage} />
      </div>
    );
  }

  if (!item) {
    return <div className="main-content" />;
  }

  const hasUrl = item.url ? item.url.indexOf('http') === 0 : false;
  const target = settings.openLinkInNewTab ? '_blank' : undefined;
  const rel = settings.openLinkInNewTab ? 'noopener' : undefined;

  const laptopHeader = item.comments_count > 0 || item.type === 'job';

  return (
    <div className="main-content">
      <div className="item">
        <div className="mobile item-header">
          <p className="title-block">
            <span className="back-button" onClick={() => navigate(-1)}></span>
            {hasUrl ? (
              <a className="title" href={item.url} target={target} rel={rel}>
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
          className={`laptop${laptopHeader ? ' item-header' : ''}${item.content ? ' head-margin' : ''}`}
        >
          {hasUrl ? (
            <p>
              <a className="title" href={item.url} target={target} rel={rel}>
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
                  <Link to={`/item/${item.id}`}>
                    {commentPipe(item.comments_count)}
                  </Link>
                </span>
              )}
            </span>
          </div>
        </div>
        {item.type === 'poll' && item.poll && (
          <div className="pollResults">
            {item.poll.map((pollResult, i) => (
              <div key={i} className="pollContent">
                <div dangerouslySetInnerHTML={{ __html: pollResult.content }} />
                <div className="subtext">{pollResult.points} points</div>
                <div
                  className="pollBar"
                  style={{
                    width: `${(pollResult.points / item.poll_votes_count) * 100}%`,
                  }}
                />
              </div>
            ))}
          </div>
        )}
        <p
          className="subject"
          dangerouslySetInnerHTML={{ __html: item.content || '' }}
        />
        <ul className="comment-list">
          {item.comments?.map(comment => (
            <li key={comment.id}>
              <Comment comment={comment} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default ItemDetails;
