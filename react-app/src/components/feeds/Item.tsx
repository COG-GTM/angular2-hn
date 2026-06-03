import { Link } from 'react-router-dom';
import { useSettings } from '../../context/useSettings';
import { formatComment } from '../../utils/formatComment';
import type { Story } from '../../types/Story';

interface ItemProps {
  item: Story;
}

export function Item({ item }: ItemProps) {
  const { settings } = useSettings();
  const target = settings.openLinkInNewTab ? '_blank' : '_self';

  const titleStyle = {
    fontSize: `${settings.titleFontSize}px`,
  };

  const spacingStyle = {
    marginBottom: `${settings.listSpacing}px`,
  };

  const isExternalLink = item.url && !item.url.startsWith('item?id=');

  return (
    <li style={spacingStyle}>
      <div className="item-container">
        {isExternalLink ? (
          <a
            href={item.url}
            target={target}
            rel="noopener noreferrer"
            style={titleStyle}
            className="item-title"
          >
            {item.title}
          </a>
        ) : (
          <Link to={`/item/${item.id}`} style={titleStyle} className="item-title">
            {item.title}
          </Link>
        )}

        {item.domain && <span className="domain">({item.domain})</span>}

        {/* Mobile layout */}
        <div className="subtext-palm">
          {item.points !== undefined && item.points !== null && (
            <span>{item.points} points</span>
          )}
          {item.user && (
            <>
              {' '}
              by <Link to={`/user/${item.user}`}>{item.user}</Link>
            </>
          )}
          {' '}{item.time_ago}
          {' | '}
          <Link to={`/item/${item.id}`}>{formatComment(item.comments_count)}</Link>
        </div>

        {/* Laptop layout */}
        <div className="subtext-laptop">
          {item.points !== undefined && item.points !== null && (
            <span>{item.points} points</span>
          )}
          {item.user && (
            <>
              {' '}
              by <Link to={`/user/${item.user}`}>{item.user}</Link>
            </>
          )}
          {' '}{item.time_ago}
          {' | '}
          <Link to={`/item/${item.id}`}>{formatComment(item.comments_count)}</Link>
        </div>
      </div>
    </li>
  );
}
