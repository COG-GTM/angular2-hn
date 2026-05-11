import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { fetchItem } from '../api/hackerNewsApi';
import type { Story } from '../types/story';
import { useSettings } from '../context/SettingsContext';
import { Loader } from '../components/Loader';
import { ErrorMessage } from '../components/ErrorMessage';
import { Comment } from '../components/Comment';
import { formatCommentCount } from '../utils/commentUtils';
import './ItemDetails.scss';

export function ItemDetails() {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const itemId = params.id ? parseInt(params.id, 10) : NaN;
  const idIsValid = !Number.isNaN(itemId);

  const [item, setItem] = useState<Story | null>(null);
  const [errorMessage, setErrorMessage] = useState(
    idIsValid ? '' : 'Invalid item id.'
  );
  const [prevId, setPrevId] = useState(params.id);

  if (prevId !== params.id) {
    setPrevId(params.id);
    setItem(null);
    setErrorMessage(idIsValid ? '' : 'Invalid item id.');
  }

  const doFetch = useCallback((id: number, signal: AbortSignal) => {
    fetchItem(id, signal)
      .then((result) => setItem(result))
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setErrorMessage('Could not load item comments.');
      });
  }, []);

  useEffect(() => {
    if (!idIsValid) return;

    const controller = new AbortController();
    doFetch(itemId, controller.signal);
    window.scrollTo(0, 0);

    return () => controller.abort();
  }, [itemId, idIsValid, doFetch]);

  const goBack = () => navigate(-1);
  const hasUrl = item?.url?.indexOf('http') === 0;
  const linkTarget = settings.openLinkInNewTab ? '_blank' : undefined;
  const linkRel = settings.openLinkInNewTab ? 'noopener noreferrer' : undefined;

  return (
    <div className="main-content item-details-page">
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
                  target={linkTarget}
                  rel={linkRel}
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
            className={[
              'laptop',
              item.comments_count > 0 || item.type === 'job' ? 'item-header' : '',
              item.content ? 'head-margin' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {hasUrl ? (
              <p>
                <a
                  className="title"
                  href={item.url}
                  target={linkTarget}
                  rel={linkRel}
                >
                  {item.title}
                </a>
                {item.domain && <span className="domain"> ({item.domain})</span>}
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
                    {' | '}
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
              {item.poll.map((pollResult, idx) => (
                <div key={idx} className="pollContent">
                  <div dangerouslySetInnerHTML={{ __html: pollResult.content }} />
                  <div className="subtext">{pollResult.points} points</div>
                  <div
                    className="pollBar"
                    style={{
                      width: `${
                        ((pollResult.points || 0) /
                          (item.poll_votes_count || 1)) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
              ))}
            </div>
          )}
          {item.content && (
            <p
              className="subject"
              dangerouslySetInnerHTML={{ __html: item.content }}
            />
          )}
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

export default ItemDetails;
