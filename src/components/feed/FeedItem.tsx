import { Link } from 'react-router-dom';
import { Story } from '../../types/story';
import { useSettings } from '../../context/SettingsContext';
import { formatCommentCount } from '../../utils/commentUtils';
import './FeedItem.scss';

interface FeedItemProps {
  item: Story;
  index: number;
}

export default function FeedItem({ item, index }: FeedItemProps) {
  const { settings } = useSettings();
  const hasExternalUrl = item.url && !item.url.startsWith('item?');
  const target = settings.openLinkInNewTab ? '_blank' : '_self';

  return (
    <div
      className="feed-item"
      style={{ marginBottom: `${settings.listSpacing}px` }}
    >
      <div className="feed-item-number">{index + 1}.</div>
      <div className="feed-item-content">
        <div className="feed-item-title" style={{ fontSize: `${settings.titleFontSize}px` }}>
          {hasExternalUrl ? (
            <a href={item.url} target={target} rel="noopener noreferrer">
              {item.title}
            </a>
          ) : (
            <Link to={`/item/${item.id}`}>{item.title}</Link>
          )}
          {item.domain && (
            <span className="feed-item-domain">({item.domain})</span>
          )}
        </div>
        <div className="feed-item-meta">
          {item.points !== null && item.points !== undefined && (
            <span>{item.points} points</span>
          )}
          {item.user && (
            <span>
              {' '}by <Link to={`/user/${item.user}`} className="feed-item-user">{item.user}</Link>
            </span>
          )}
          {item.time_ago && <span> {item.time_ago}</span>}
          {' | '}
          <Link to={`/item/${item.id}`} className="feed-item-comments">
            {formatCommentCount(item.comments_count)}
          </Link>
        </div>
      </div>
    </div>
  );
}
