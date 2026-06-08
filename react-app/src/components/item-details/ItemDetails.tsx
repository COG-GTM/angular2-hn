import { useEffect, useReducer } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchItemContent } from '../../hooks/useHackerNewsApi';
import { useSettings } from '../../context/SettingsContext';
import type { Story } from '../../models/types';
import { formatCommentCount } from '../../utils/formatCommentCount';
import CommentComponent from './Comment';
import Loader from '../shared/Loader';
import ErrorMessage from '../shared/ErrorMessage';
import './ItemDetails.scss';

interface ItemState {
  item: Story | null;
  errorMessage: string;
}

type ItemAction =
  | { type: 'loading' }
  | { type: 'success'; item: Story }
  | { type: 'error'; message: string };

function itemReducer(_state: ItemState, action: ItemAction): ItemState {
  switch (action.type) {
    case 'loading':
      return { item: null, errorMessage: '' };
    case 'success':
      return { item: action.item, errorMessage: '' };
    case 'error':
      return { item: null, errorMessage: action.message };
  }
}

export default function ItemDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const [state, dispatch] = useReducer(itemReducer, { item: null, errorMessage: '' });

  useEffect(() => {
    if (!id) return;

    let cancelled = false;
    dispatch({ type: 'loading' });

    fetchItemContent(parseInt(id, 10))
      .then(data => {
        if (!cancelled) dispatch({ type: 'success', item: data });
      })
      .catch(() => {
        if (!cancelled) dispatch({ type: 'error', message: 'Could not load item comments.' });
      });

    window.scrollTo(0, 0);
    return () => { cancelled = true; };
  }, [id]);

  const goBack = () => navigate(-1);

  const { item, errorMessage } = state;
  const hasUrl = item ? item.url && item.url.indexOf('http') === 0 : false;

  return (
    <div className="main-content">
      {!item && !errorMessage && <Loader />}
      {!item && errorMessage && <ErrorMessage message={errorMessage} />}

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
                  rel={settings.openLinkInNewTab ? 'noopener noreferrer' : undefined}
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
          <div className={`laptop ${item.comments_count > 0 || item.type === 'job' ? 'item-header' : ''} ${item.content ? 'head-margin' : ''}`}>
            {hasUrl ? (
              <p>
                <a
                  className="title"
                  href={item.url}
                  target={settings.openLinkInNewTab ? '_blank' : undefined}
                  rel={settings.openLinkInNewTab ? 'noopener noreferrer' : undefined}
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
              {item.poll.map((pollResult, i) => (
                <div key={i} className="pollContent">
                  <div dangerouslySetInnerHTML={{ __html: pollResult.content }} />
                  <div className="subtext">{pollResult.points} points</div>
                  <div
                    className="pollBar"
                    style={{ width: `${(pollResult.points / (item.poll_votes_count || 1)) * 100}%` }}
                  />
                </div>
              ))}
            </div>
          )}

          {item.content && (
            <p className="subject" dangerouslySetInnerHTML={{ __html: item.content }} />
          )}

          <ul className="comment-list">
            {item.comments && item.comments.map(comment => (
              <li key={comment.id}>
                <CommentComponent comment={comment} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
