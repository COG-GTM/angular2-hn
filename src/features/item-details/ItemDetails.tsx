import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { fetchItemContent } from '../../api/hackernews';
import ErrorMessage from '../../components/ErrorMessage';
import Loader from '../../components/Loader';
import { useSettings } from '../../context/SettingsContext';
import { Story } from '../../types/story';
import { formatCommentCount } from '../../utils/formatCommentCount';
import Comment from './Comment';
import '../../styles/item-details.scss';

export default function ItemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { settings } = useSettings();

  const [item, setItem] = useState<Story | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    setItem(undefined);
    setErrorMessage('');

    fetchItemContent(Number(id), controller.signal)
      .then((data) => setItem(data))
      .catch(() => {
        if (controller.signal.aborted) {
          return;
        }
        setErrorMessage('Could not load item comments.');
      });

    window.scrollTo(0, 0);

    return () => controller.abort();
  }, [id]);

  const goBack = () => navigate(-1);

  const hasUrl = !!item && !!item.url && item.url.indexOf('http') === 0;
  const target = settings.openLinkInNewTab ? '_blank' : undefined;
  const rel = settings.openLinkInNewTab ? 'noopener' : undefined;

  const laptopClass = [
    'laptop',
    item && (item.comments_count > 0 || item.type === 'job') ? 'item-header' : '',
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
              <span className="back-button" onClick={goBack}></span>
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

          <div className={laptopClass}>
            {hasUrl ? (
              <p>
                <a className="title" href={item.url} target={target} rel={rel}>
                  {item.title}
                </a>
                {item.domain ? (
                  <span className="domain"> ({item.domain})</span>
                ) : null}
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
                {' '}
                {item.time_ago}
                {item.type !== 'job' && (
                  <span>
                    {' '}
                    |{' '}
                    <Link to={`/item/${item.id}`}>
                      {formatCommentCount(item.comments_count)}
                    </Link>
                  </span>
                )}
              </span>
            </div>
          </div>

          {item.type === 'poll' && (
            <div className="pollResults">
              {item.poll.map((pollResult, index) => (
                <div className="pollContent" key={index}>
                  <div
                    dangerouslySetInnerHTML={{ __html: pollResult.content }}
                  />
                  <div className="subtext">{pollResult.points} points</div>
                  <div
                    className="pollBar"
                    style={{
                      width: `${
                        (pollResult.points / item.poll_votes_count) * 100
                      }%`,
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
