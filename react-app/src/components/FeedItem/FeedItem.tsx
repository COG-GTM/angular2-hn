import { Link } from 'react-router-dom';
import type { Story } from '../../models/story';
import { useSettings } from '../../contexts/SettingsContext';
import { formatCommentCount } from '../../utils/comment-pipe';
import './FeedItem.scss';

interface FeedItemProps {
  item: Story;
}

export function FeedItem({ item }: FeedItemProps) {
  const { settings } = useSettings();
  const hasUrl = item.url?.startsWith('http');

  const titleStyle = {
    fontSize: `${settings.titleFontSize}px`,
  };

  const target = settings.openLinkInNewTab ? '_blank' : undefined;
  const rel = settings.openLinkInNewTab ? 'noopener noreferrer' : undefined;

  return (
    <div style={{ marginBottom: `${settings.listSpacing}px` }}>
      {hasUrl ? (
        <p>
          <a className="title" style={titleStyle} href={item.url} target={target} rel={rel}>
            {item.title}
          </a>
          {item.domain && <>{' '}<span className="domain">({item.domain})</span></>}
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
            <span className="name"><Link to={`/user/${item.user}`}>{item.user}</Link></span>
            <span className="right">{item.points} ★</span>
          </div>
        )}
        <div className="details">
          {item.time_ago}
          {item.type !== 'job' && (
            <Link to={`/item/${item.id}`} className="comment-number"> • {formatCommentCount(item.comments_count)}</Link>
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
            <span> | <Link to={`/item/${item.id}`}>{formatCommentCount(item.comments_count)}</Link></span>
          )}
        </span>
      </div>
    </div>
  );
}
