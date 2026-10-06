// Ported from src/app/feeds/item/item.component.{ts,html}
import { Link } from 'react-router-dom';
import { useSettings } from '../../settings/SettingsContext';
import type { Story } from '../../types';
import { commentLabel, externalLinkProps, hasExternalUrl } from '../../utils/format';
import './ItemCard.scss';

export function ItemCard({ item }: { item: Story }) {
  const { settings } = useSettings();
  const isJob = item.type === 'job';
  const titleStyle = { fontSize: `${settings.titleFontSize}px` };
  const comments = commentLabel(item.comments_count);

  return (
    <div className="item-card" style={{ marginBottom: `${settings.listSpacing}px` }}>
      {hasExternalUrl(item.url) ? (
        <p>
          <a className="title" style={titleStyle} href={item.url} {...externalLinkProps(settings.openLinkInNewTab)}>
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
            </span>
            <span className="right">{item.points} ★</span>
          </div>
        )}
        <div className="details">
          {item.time_ago}
          {!isJob && (
            <>
              {' '}
              <Link to={`/item/${item.id}`} className="comment-number">
                • {comments}
              </Link>
            </>
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
              <Link to={`/item/${item.id}`}>{comments}</Link>
            </span>
          )}
        </span>
      </div>
    </div>
  );
}
