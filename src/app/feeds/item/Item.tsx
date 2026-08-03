import { Link, NavLink } from 'react-router-dom';

import type { Story } from '../../shared/models';
import { useSettings } from '../../shared/context/useSettings';
import { commentLabel } from '../../shared/utils/commentLabel';
import './Item.scss';

const activeClassName = ({ isActive }: { isActive: boolean }) => (isActive ? 'active' : undefined);

export function Item({ item }: { item: Story }) {
  const { settings } = useSettings();
  const hasUrl = item.url?.indexOf('http') === 0;
  const titleStyle = { fontSize: `${settings.titleFontSize}px` };

  return (
    <div className="item-view item-block" style={{ marginBottom: `${settings.listSpacing}px` }}>
      {hasUrl ? (
        <p>
          <a
            className="title"
            style={titleStyle}
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
          <Link className="title" style={titleStyle} to={`/item/${item.id}`}>
            {item.title}
          </Link>
        </p>
      )}
      <div className="subtext-palm">
        {item.type !== 'job' && (
          <div className="details">
            <span className="name">
              <NavLink className={activeClassName} to={`/user/${item.user}`}>
                {item.user}
              </NavLink>
            </span>
            <span className="right">{item.points} ★</span>
          </div>
        )}
        <div className="details">
          {item.time_ago}
          {item.type !== 'job' && (
            <NavLink className={({ isActive }) => `comment-number${isActive ? ' active' : ''}`} to={`/item/${item.id}`}>
              {' '}
              • {commentLabel(item.comments_count)}
            </NavLink>
          )}
        </div>
      </div>
      <div className="subtext-laptop">
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
  );
}
