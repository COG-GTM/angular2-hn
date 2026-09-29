import { useCallback, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { ErrorMessage } from '../shared/components/error-message/ErrorMessage';
import { Loader } from '../shared/components/loader/Loader';
import { useAsync } from '../shared/hooks/useAsync';
import { fetchItemContent } from '../shared/services/hackernewsApi';
import { useSettings } from '../shared/settings/settingsContext';
import { formatCommentCount } from '../shared/utils/formatCommentCount';
import { hasExternalUrl, linkTargetProps, sanitizedHtml } from '../shared/utils/html';
import { Comment } from './comment/Comment';
import './ItemDetails.scss';

export function ItemDetails() {
  const { id } = useParams();
  const itemId = Number(id);
  const navigate = useNavigate();
  const { settings } = useSettings();

  const loadItem = useCallback((signal: AbortSignal) => fetchItemContent(itemId, signal), [itemId]);
  const { data: item, error } = useAsync(loadItem);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [itemId]);

  const targetProps = linkTargetProps(settings.openLinkInNewTab);

  const renderTitle = (withDomain: boolean) =>
    item &&
    (hasExternalUrl(item.url) ? (
      <>
        <a className="title" href={item.url} {...targetProps}>
          {item.title}
        </a>
        {withDomain && item.domain && <span className="domain"> ({item.domain})</span>}
      </>
    ) : (
      <Link className="title" to={`/item/${item.id}`}>
        {item.title}
      </Link>
    ));

  const laptopClasses = item
    ? [
        'laptop',
        (item.comments_count > 0 || item.type === 'job') && 'item-header',
        item.content && 'head-margin',
      ]
        .filter(Boolean)
        .join(' ')
    : '';

  return (
    <div className="item-details-component">
      <div className="main-content">
        {!item && !error && <Loader />}
        {!item && !!error && <ErrorMessage message="Could not load item comments." />}

        {item && (
          <div className="item">
            <div className="mobile item-header">
              <p className="title-block">
                <span className="back-button" aria-label="Back" onClick={() => navigate(-1)}></span>
                {renderTitle(false)}
              </p>
            </div>
            <div className={laptopClasses}>
              <p>{renderTitle(true)}</p>
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
            {item.type === 'poll' && item.poll && (
              <div className="pollResults">
                {item.poll.map((pollResult, index) => (
                  <div key={index} className="pollContent">
                    <div dangerouslySetInnerHTML={sanitizedHtml(pollResult.content)} />
                    <div className="subtext">{pollResult.points} points</div>
                    <div
                      className="pollBar"
                      style={{ width: `${(pollResult.points / (item.poll_votes_count || 1)) * 100}%` }}
                    ></div>
                  </div>
                ))}
              </div>
            )}
            <p className="subject" dangerouslySetInnerHTML={sanitizedHtml(item.content)} />
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
