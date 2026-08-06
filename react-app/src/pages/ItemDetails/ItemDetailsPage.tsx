import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { fetchItemContent } from '../../api/hackernewsApi';
import { useSettings } from '../../context/SettingsContext';
import type { Story } from '../../models';
import { commentText } from '../../utils/commentText';
import Loader from '../../components/Loader/Loader';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import Comment from './Comment/Comment';
import './ItemDetailsPage.scss';

type StoryDetails = Story & { content?: string };

function ItemDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const [item, setItem] = useState<StoryDetails | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setItem(null);
    setErrorMessage('');
    let cancelled = false;
    fetchItemContent(Number(id))
      .then((fetchedItem) => {
        if (!cancelled) {
          setItem(fetchedItem as StoryDetails);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setErrorMessage('Could not load item comments.');
        }
      });
    window.scrollTo(0, 0);
    return () => {
      cancelled = true;
    };
  }, [id]);

  const hasUrl = item ? item.url.indexOf('http') === 0 : false;

  return (
    <div className="main-content">
      {!item && !errorMessage && <Loader />}
      {!item && errorMessage !== '' && <ErrorMessage message={errorMessage} />}

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
            className={`laptop${
              item.comments_count > 0 || item.type === 'job' ? ' item-header' : ''
            }${item.content ? ' head-margin' : ''}`}
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
                  {item.points} points by <Link to={`/user/${item.user}`}>{item.user}</Link>
                </span>
              )}
              <span className={item.type !== 'job' ? 'item-details' : undefined}>
                {item.time_ago}
                {item.type !== 'job' && (
                  <span>
                    {' '}
                    | <Link to={`/item/${item.id}`}>{commentText(item.comments_count)}</Link>
                  </span>
                )}
              </span>
            </div>
          </div>
          {item.type === 'poll' && (
            <div className="pollResults">
              {item.poll.map((pollResult, index) => (
                <div className="pollContent" key={index}>
                  <div dangerouslySetInnerHTML={{ __html: pollResult.content }}></div>
                  <div className="subtext">{pollResult.points} points</div>
                  <div
                    className="pollBar"
                    style={{
                      width: `${(pollResult.points / item.poll_votes_count) * 100}%`,
                    }}
                  ></div>
                </div>
              ))}
            </div>
          )}
          <p className="subject" dangerouslySetInnerHTML={{ __html: item.content ?? '' }}></p>
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

export default ItemDetailsPage;
