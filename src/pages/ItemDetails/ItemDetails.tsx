import { useEffect, useState } from 'react';
import { NavLink, useNavigate, useParams } from 'react-router-dom';

import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import Loader from '../../components/Loader/Loader';
import { useSettings } from '../../context/SettingsContext';
import type { Story } from '../../models/story';
import { fetchItemContent } from '../../services/hackernews-api';
import { commentLabel } from '../../utils/comment';
import Comment from '../Comment/Comment';
import './ItemDetails.scss';

export default function ItemDetails() {
  const [item, setItem] = useState<Story>();
  const [errorMessage, setErrorMessage] = useState('');
  const { id } = useParams();
  const itemID = +(id ?? 0);
  const navigate = useNavigate();
  const { settings } = useSettings();

  useEffect(() => {
    let stale = false;
    setItem(undefined);
    setErrorMessage('');
    fetchItemContent(itemID)
      .then((data) => {
        if (!stale) setItem(data);
      })
      .catch(() => {
        if (!stale) setErrorMessage('Could not load item comments.');
      });
    window.scrollTo(0, 0);
    return () => {
      stale = true;
    };
  }, [itemID]);

  const goBack = () => navigate(-1);
  const hasUrl = item && item.url.indexOf('http') === 0;
  const laptopClassName = [
    'laptop',
    item && (item.comments_count > 0 || item.type === 'job')
      ? 'item-header'
      : '',
    item && item.text ? 'head-margin' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="main-content">
      {!item && !errorMessage && <Loader />}
      {!item && errorMessage !== '' && <ErrorMessage message={errorMessage} />}

      {item && (
        <div className="item">
          <div className="mobile item-header">
            <p className="title-block">
              <span className="back-button" onClick={() => goBack()}></span>
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
                <NavLink
                  to={`/item/${item.id}`}
                  className={({ isActive }) =>
                    isActive ? 'active' : undefined
                  }
                >
                  {item.title}
                </NavLink>
              )}
            </p>
          </div>
          <div className={laptopClassName}>
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
                <NavLink
                  className={({ isActive }) =>
                    isActive ? 'active' : undefined
                  }
                  to={`/item/${item.id}`}
                >
                  {item.title}
                </NavLink>
              </p>
            )}
            <div className="subtext">
              {item.type !== 'job' && (
                <span>
                  {item.points} points by{' '}
                  <NavLink
                    to={`/user/${item.user}`}
                    className={({ isActive }) =>
                      isActive ? 'active' : undefined
                    }
                  >
                    {item.user}
                  </NavLink>
                </span>
              )}
              <span className={item.type !== 'job' ? 'item-details' : undefined}>
                {item.time_ago}{' '}
                {item.type !== 'job' && (
                  <span>
                    {' '}
                    |{' '}
                    <NavLink
                      to={`/item/${item.id}`}
                      className={({ isActive }) =>
                        isActive ? 'active' : undefined
                      }
                    >
                      {commentLabel(item.comments_count)}
                    </NavLink>
                  </span>
                )}
              </span>
            </div>
          </div>
          {item.type === 'poll' && (
            <div className="pollResults">
              {item.poll.map((pollResult, i) => (
                <div className="pollContent" key={i}>
                  <div dangerouslySetInnerHTML={{ __html: pollResult.content }}></div>
                  <div className="subtext">{pollResult.points} points</div>
                  <div
                    className="pollBar"
                    style={{
                      width:
                        (pollResult.points / item.poll_votes_count) * 100 + '%',
                    }}
                  ></div>
                </div>
              ))}
            </div>
          )}
          <p
            className="subject"
            dangerouslySetInnerHTML={{ __html: item.content ?? '' }}
          ></p>
          <ul className="comment-list">
            {item.comments.map((comment) => (
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
