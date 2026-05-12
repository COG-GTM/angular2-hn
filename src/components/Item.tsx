import { Link } from 'react-router-dom';
import type { Story } from '../types/story';
import { useSettings } from '../contexts/SettingsContext';
import { formatComment } from '../utils/formatComment';
import './item.component.scss';

interface ItemProps {
  item: Story;
}

export default function Item({ item }: ItemProps) {
  const { settings } = useSettings();
  const hasUrl = typeof item.url === 'string' && item.url.indexOf('http') === 0;
  const titleStyle = { fontSize: `${settings.titleFontSize}px` };
  const wrapperStyle = { marginBottom: `${settings.listSpacing}px` };

  return (
    <div style={wrapperStyle}>
      {hasUrl ? (
        <p>
          <a
            className="title"
            style={titleStyle}
            href={item.url}
            target={settings.openLinkInNewTab ? '_blank' : undefined}
            rel={settings.openLinkInNewTab ? 'noopener noreferrer' : undefined}
          >
            {item.title}
          </a>
          {item.domain && <span className="domain"> ({item.domain})</span>}
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
              <Link to={`/user/${item.user}`}>{item.user}</Link>
            </span>
            <span className="right">{item.points} ★</span>
          </div>
        )}
        <div className="details">
          {item.time_ago}
          {item.type !== 'job' && (
            <Link to={`/item/${item.id}`} className="comment-number">
              {' • '}
              {formatComment(item.comments_count)}
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
              {' | '}
              <Link to={`/item/${item.id}`}>{formatComment(item.comments_count)}</Link>
            </span>
          )}
        </span>
      </div>
    </div>
  );
}
