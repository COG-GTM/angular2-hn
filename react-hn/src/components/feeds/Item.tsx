import { Link } from 'react-router-dom';
import { useSettings } from '../../hooks/useSettings';
import { formatComment } from '../../utils/formatComment';
import type { Story } from '../../models/story';
import './Item.css';

interface ItemProps {
  item: Story;
}

export function Item({ item }: ItemProps) {
  const { settings } = useSettings();
  const hasUrl = item.url.indexOf('http') === 0;

  return (
    <div style={{ marginBottom: `${settings.listSpacing}px` }}>
      {hasUrl ? (
        <p>
          <a
            className="title"
            style={{ fontSize: `${settings.titleFontSize}px` }}
            href={item.url}
            {...(settings.openLinkInNewTab ? { target: '_blank', rel: 'noopener' } : {})}
          >
            {item.title}
          </a>
          {item.domain && <span className="domain">({item.domain})</span>}
        </p>
      ) : (
        <p>
          <Link
            className="title"
            style={{ fontSize: `${settings.titleFontSize}px` }}
            to={`/item/${item.id}`}
          >
            {item.title}
          </Link>
        </p>
      )}
      <div className="subtext-palm">
        {item.type !== 'job' && (
          <div className="details">
            <span className="name">
              <Link to={`/user/${item.user}`}>{item.user}</Link>
            </span>
            <span className="right">{item.points} ★</span>
          </div>
        )}
        <div className="details">
          {item.time_ago}
          {item.type !== 'job' && (
            <Link to={`/item/${item.id}`} className="comment-number">
              {' '}
              • {formatComment(item.comments_count)}
            </Link>
          )}
        </div>
      </div>
      <div className="subtext-laptop">
        {item.type !== 'job' && (
          <span>
            {item.points} points by{' '}
            <Link to={`/user/${item.user}`}>{item.user}</Link>
          </span>
        )}
        <span className={item.type !== 'job' ? 'item-details' : ''}>
          {item.time_ago}
          {item.type !== 'job' && (
            <span>
              {' '}
              |{' '}
              <Link to={`/item/${item.id}`}>{formatComment(item.comments_count)}</Link>
            </span>
          )}
        </span>
      </div>
    </div>
  );
}
