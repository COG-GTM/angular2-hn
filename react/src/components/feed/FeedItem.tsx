// Port of src/app/feeds/item (selector `item`, used as <item class="item-block">).
import { NavLink } from 'react-router-dom';
import type { Story } from '../../api/types';
import { useSettings } from '../../settings/SettingsContext';
import { commentLabel } from '../../utils/commentLabel';
import './FeedItem.scss';

export function FeedItem({ item }: { item: Story }) {
  const { settings } = useSettings();
  const hasUrl = item.url.indexOf('http') === 0;
  const isJob = item.type === 'job';
  const titleStyle = { fontSize: `${settings.titleFontSize}px` };

  return (
    <div className="app-item item-block">
      <div style={{ marginBottom: `${settings.listSpacing}px` }}>
        {hasUrl && (
          <p>
            <a
              className="title"
              style={titleStyle}
              href={item.url}
              target={settings.openLinkInNewTab ? '_blank' : undefined}
              rel={settings.openLinkInNewTab ? 'noopener' : undefined}
            >
              {` ${item.title} `}
            </a>
            {item.domain && <span className="domain">({item.domain})</span>}
          </p>
        )}
        {!hasUrl && (
          <p>
            <NavLink className="title" style={titleStyle} to={`/item/${item.id}`}>
              {` ${item.title} `}
            </NavLink>
          </p>
        )}
        <div className="subtext-palm">
          {!isJob && (
            <div className="details">
              <span className="name">
                <NavLink to={`/user/${item.user}`}>{item.user}</NavLink>
              </span>
              <span className="right">{`${item.points} ★`}</span>
            </div>
          )}
          <div className="details">
            {` ${item.time_ago} `}
            {!isJob && (
              <NavLink to={`/item/${item.id}`} className="comment-number">
                {` • ${commentLabel(item.comments_count)} `}
              </NavLink>
            )}
          </div>
        </div>
        <div className="subtext-laptop">
          {!isJob && (
            <span>
              {` ${item.points} points by `}
              <NavLink to={`/user/${item.user}`}>{item.user}</NavLink>
            </span>
          )}
          <span className={isJob ? undefined : 'item-details'}>
            {` ${item.time_ago} `}
            {!isJob && (
              <span>
                {' | '}
                <NavLink to={`/item/${item.id}`}>{` ${commentLabel(item.comments_count)} `}</NavLink>
              </span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
