import { NavLink } from 'react-router-dom';
import type { Story } from '../../api/types';
import { useSettings } from '../../settings/useSettings';
import { commentLabel } from '../../utils/commentLabel';
import { hasUrl } from '../../utils/hasUrl';
import { externalLinkProps } from '../../utils/linkProps';
import './Item.scss';

/** Port of the Angular `item` component: one feed row. */
export function Item({ item, className }: { item: Story; className?: string }) {
  const { titleFontSize, listSpacing, openLinkInNewTab } = useSettings();
  const isJob = item.type === 'job';
  const titleStyle = { fontSize: `${titleFontSize}px` };

  return (
    <div className={className ? `hn-item ${className}` : 'hn-item'}>
      <div style={{ marginBottom: `${listSpacing}px` }}>
        {hasUrl(item.url) ? (
          <p>
            <a className="title" style={titleStyle} href={item.url} {...externalLinkProps(openLinkInNewTab)}>
              {' '}{item.title}{' '}
            </a>
            {item.domain && <span className="domain">({item.domain})</span>}
          </p>
        ) : (
          <p>
            <NavLink className="title" style={titleStyle} to={`/item/${item.id}`}>
              {' '}{item.title}{' '}
            </NavLink>
          </p>
        )}
        <div className="subtext-palm">
          {!isJob && (
            <div className="details">
              <span className="name"><NavLink to={`/user/${item.user}`}>{item.user}</NavLink></span>
              <span className="right">{item.points} ★</span>
            </div>
          )}
          <div className="details">
            {' '}{item.time_ago}{' '}
            {!isJob && (
              <NavLink to={`/item/${item.id}`} className="comment-number">
                {' '}• {commentLabel(item.comments_count)}{' '}
              </NavLink>
            )}
          </div>
        </div>
        <div className="subtext-laptop">
          {!isJob && (
            <span>
              {' '}{item.points} points by <NavLink to={`/user/${item.user}`}>{item.user}</NavLink>
            </span>
          )}
          <span className={isJob ? undefined : 'item-details'}>
            {' '}{item.time_ago}{' '}
            {!isJob && (
              <span>
                {' '}|{' '}
                <NavLink to={`/item/${item.id}`}> {commentLabel(item.comments_count)} </NavLink>
              </span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
