import { NavLink } from 'react-router-dom';
import type { Story } from '../../api/types';
import { commentLabel } from '../../utils/commentLabel';
import { Comment } from './Comment';
import './ItemDetails.scss';

/** Loaded-item body of <app-item-details>; rendered inside `.app-item-details .main-content`. */
export function ItemDetails({ item, openLinkInNewTab, goBack }: { item: Story; openLinkInNewTab: boolean; goBack: () => void }) {
  const hasUrl = item.url.indexOf('http') === 0;
  const externalLinkAttrs = {
    href: item.url,
    target: openLinkInNewTab ? '_blank' : undefined,
    rel: openLinkInNewTab ? 'noopener' : undefined,
  };
  const laptopClass = ['laptop'];
  if (item.comments_count > 0 || item.type === 'job') laptopClass.push('item-header');
  // Mirrors the Angular binding `[class.head-margin]="item.text"`; `text` is not part of the Story model.
  if ('text' in item && item.text) laptopClass.push('head-margin');

  return (
    <div className="item">
      <div className="mobile item-header">
        <p className="title-block">
          <span className="back-button" onClick={goBack}></span>
          {hasUrl ? (
            <a className="title" {...externalLinkAttrs}>
              {' '}
              {item.title}{' '}
            </a>
          ) : (
            <NavLink className="title" to={`/item/${item.id}`}>
              {' '}
              {item.title}{' '}
            </NavLink>
          )}
        </p>
      </div>
      <div className={laptopClass.join(' ')}>
        {hasUrl ? (
          <p>
            <a className="title" {...externalLinkAttrs}>
              {' '}
              {item.title}{' '}
            </a>
            {item.domain && <span className="domain">({item.domain})</span>}
          </p>
        ) : (
          <p>
            <NavLink className="title" to={`/item/${item.id}`}>
              {' '}
              {item.title}{' '}
            </NavLink>
          </p>
        )}
        <div className="subtext">
          {item.type !== 'job' && (
            <span>
              {' '}
              {item.points} points by <NavLink to={`/user/${item.user}`}>{item.user}</NavLink>
            </span>
          )}
          <span className={item.type !== 'job' ? 'item-details' : undefined}>
            {' '}
            {item.time_ago}{' '}
            {item.type !== 'job' && (
              <span>
                {' '}
                | <NavLink to={`/item/${item.id}`}> {commentLabel(item.comments_count)} </NavLink>
              </span>
            )}
          </span>
        </div>
      </div>
      {item.type === 'poll' && (
        <div className="pollResults">
          {item.poll?.map((pollResult, i) => (
            <div key={i} className="pollContent">
              <div dangerouslySetInnerHTML={{ __html: pollResult.content }}></div>
              <div className="subtext">{pollResult.points} points</div>
              <div
                className="pollBar"
                style={{ width: `${(pollResult.points / (item.poll_votes_count ?? NaN)) * 100}%` }}
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
  );
}
