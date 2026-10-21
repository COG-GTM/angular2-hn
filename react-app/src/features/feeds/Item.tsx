import { Link } from 'react-router-dom';

import { formatCommentCount } from '../../lib/formatCommentCount';
import type { Story } from '../../models';
import { useSettings } from '../../settings';
import './Item.scss';

export interface ItemProps {
  item: Story;
}

/** Port of src/app/feeds/item (the story row). */
export default function Item({ item }: ItemProps) {
  const { settings } = useSettings();
  const hasUrl = item.url.indexOf('http') === 0;
  const isJob = item.type === 'job';
  const titleStyle = { fontSize: `${settings.titleFontSize}px` };
  const commentCount = formatCommentCount(item.comments_count);

  return (
    <div className="item-block">
      <div style={{ marginBottom: `${settings.listSpacing}px` }}>
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
            </a>{' '}
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
          {!isJob && (
            <div className="details">
              <span className="name">
                <Link to={`/user/${item.user}`}>{item.user}</Link>
              </span>{' '}
              <span className="right">{item.points} ★</span>
            </div>
          )}
          <div className="details">
            {item.time_ago}{' '}
            {!isJob && (
              <Link to={`/item/${item.id}`} className="comment-number">
                • {commentCount}
              </Link>
            )}
          </div>
        </div>
        <div className="subtext-laptop">
          {!isJob && (
            <span>
              {item.points} points by <Link to={`/user/${item.user}`}>{item.user}</Link>{' '}
            </span>
          )}
          <span className={isJob ? undefined : 'item-details'}>
            {item.time_ago}
            {!isJob && (
              <span>
                {' | '}
                <Link to={`/item/${item.id}`}>{commentCount}</Link>
              </span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
