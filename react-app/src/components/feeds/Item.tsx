import { Link } from 'react-router-dom';
import { useSettings } from '../../context/useSettings';
import { formatComment } from '../../utils/formatComment';
import type { Story } from '../../types/Story';
import './Item.scss';

interface ItemProps {
  item: Story;
}

export function Item({ item }: ItemProps) {
  const { settings } = useSettings();
  const isExternalLink = item.url && item.url.indexOf('http') === 0;
  const isJob = item.type === 'job';

  const titleStyle = {
    fontSize: `${settings.titleFontSize}px`,
  };

  const spacingStyle = {
    marginBottom: `${settings.listSpacing}px`,
  };

  return (
    <div className="item-block" style={spacingStyle}>
      {isExternalLink ? (
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
            <Link to={`/item/${item.id}`} className="comment-number">
              {' '}• {formatComment(item.comments_count)}
            </Link>
          )}
        </div>
      </div>

      <div className="subtext-laptop">
        {!isJob && (
          <span>
            {item.points} points by{' '}
            <Link to={`/user/${item.user}`}>{item.user}</Link>
          </span>
        )}
        <span className={!isJob ? 'item-details' : undefined}>
          {item.time_ago}
          {!isJob && (
            <span>
              {' '}|{' '}
              <Link to={`/item/${item.id}`}>
                {formatComment(item.comments_count)}
              </Link>
            </span>
          )}
        </span>
      </div>
    </div>
  );
}
