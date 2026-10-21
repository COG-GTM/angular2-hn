import { useEffect, useState } from 'react';
import { NavLink, useNavigate, useParams } from 'react-router-dom';

import { fetchItemContent } from '../../api/hackernews';
import ErrorMessage from '../../components/shared/ErrorMessage';
import Loader from '../../components/shared/Loader';
import { formatCommentCount } from '../../lib/formatCommentCount';
import { sanitizeHtml } from '../../lib/sanitizeHtml';
import type { Story } from '../../models';
import { useSettings } from '../../settings';
import Comment from './Comment';
import './ItemDetailsPage.scss';

/** Port of src/app/item-details/item-details.component. */
export default function ItemDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const [state, setState] = useState<{ id?: string; item?: Story; errorMessage?: string }>({});

  useEffect(() => {
    const controller = new AbortController();
    fetchItemContent(Number(id), controller.signal)
      .then(
        (item) => ({ id, item }),
        () => ({ id, errorMessage: 'Could not load item comments.' })
      )
      .then((next) => !controller.signal.aborted && setState(next));
    window.scrollTo(0, 0);
    return () => controller.abort();
  }, [id]);

  const item = state.id === id ? state.item : undefined;
  const errorMessage = state.id === id ? state.errorMessage : undefined;
  const target = settings.openLinkInNewTab ? '_blank' : undefined;
  const rel = settings.openLinkInNewTab ? 'noopener' : undefined;
  const hasUrl = item?.url.startsWith('http') ?? false;
  const votes = item?.poll_votes_count ?? 0;
  const titleLink =
    item &&
    (hasUrl ? (
      <a className="title" href={item.url} target={target} rel={rel}>
        {item.title}
      </a>
    ) : (
      <NavLink className="title" to={`/item/${item.id}`}>
        {item.title}
      </NavLink>
    ));

  return (
    <div className="app-item-details">
      <div className="main-content">
        {!item && !errorMessage && <Loader />}
        {!item && errorMessage && <ErrorMessage message={errorMessage} />}
        {item && (
          <div className="item">
            <div className="mobile item-header">
              <p className="title-block">
                <span className="back-button" onClick={() => navigate(-1)} />
                {titleLink}
              </p>
            </div>
            <div className={item.comments_count > 0 || item.type === 'job' ? 'laptop item-header' : 'laptop'}>
              <p>
                {titleLink}
                {hasUrl && item.domain && <span className="domain"> ({item.domain})</span>}
              </p>
              <div className="subtext">
                {item.type !== 'job' && (
                  <span>
                    {item.points} points by <NavLink to={`/user/${item.user}`}>{item.user}</NavLink>
                  </span>
                )}
                <span className={item.type !== 'job' ? 'item-details' : undefined}>
                  {item.time_ago}{' '}
                  {item.type !== 'job' && (
                    <span>
                      | <NavLink to={`/item/${item.id}`}>{formatCommentCount(item.comments_count)}</NavLink>
                    </span>
                  )}
                </span>
              </div>
            </div>
            {item.type === 'poll' && (
              <div className="pollResults">
                {item.poll?.map((pollResult, i) => (
                  <div key={i} className="pollContent">
                    <div dangerouslySetInnerHTML={sanitizeHtml(pollResult.content)} />
                    <div className="subtext">{pollResult.points} points</div>
                    <div className="pollBar" style={{ width: `${votes ? (pollResult.points / votes) * 100 : 0}%` }} />
                  </div>
                ))}
              </div>
            )}
            <p className="subject" dangerouslySetInnerHTML={sanitizeHtml(item.content)} />
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
    </div>
  );
}
