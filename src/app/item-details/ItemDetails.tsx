import { useCallback, useEffect } from 'react';
import { Link, NavLink, useNavigate, useParams } from 'react-router-dom';

import { ErrorMessage } from '../shared/components/error-message/ErrorMessage';
import { Loader } from '../shared/components/loader/Loader';
import { useSettings } from '../shared/context/useSettings';
import { useAsyncData } from '../shared/hooks/useAsyncData';
import { fetchItemContent } from '../shared/services/hackernewsApi';
import { commentLabel } from '../shared/utils/commentLabel';
import { Comment } from './comment/Comment';
import './ItemDetails.scss';

const activeClassName = ({ isActive }: { isActive: boolean }) => (isActive ? 'active' : undefined);

export function ItemDetails() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { settings } = useSettings();

  const load = useCallback((signal: AbortSignal) => fetchItemContent(Number(id), signal), [id]);
  const state = useAsyncData(id, load);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (state.status === 'loading') {
    return (
      <div className="item-details-view main-content">
        <Loader />
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="item-details-view main-content">
        <ErrorMessage message="Could not load item comments." />
      </div>
    );
  }

  const item = state.data;
  const hasUrl = item.url?.indexOf('http') === 0;
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
    <div className="item-details-view main-content">
      <div className="item">
        <div className="mobile item-header">
          <p className="title-block">
            <span className="back-button" onClick={() => navigate(-1)}></span>
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
                {item.points} points by{' '}
                <NavLink className={activeClassName} to={`/user/${item.user}`}>
                  {item.user}
                </NavLink>
              </span>
            )}
            <span className={item.type !== 'job' ? 'item-details' : undefined}>
              {item.time_ago}
              {item.type !== 'job' && (
                <span>
                  {' '}
                  |{' '}
                  <NavLink className={activeClassName} to={`/item/${item.id}`}>
                    {commentLabel(item.comments_count)}
                  </NavLink>
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
                  style={{ width: `${(pollResult.points / (item.poll_votes_count || 1)) * 100}%` }}
                ></div>
              </div>
            ))}
          </div>
        )}
        <p className="subject" dangerouslySetInnerHTML={{ __html: item.content ?? '' }}></p>
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
