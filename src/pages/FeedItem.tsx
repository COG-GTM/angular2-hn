import { Link } from 'react-router';
import type { Story } from '../models';
import { useSettings } from '../settings';
import { formatCommentCount } from '../utils/formatCommentCount';
import './FeedItem.scss';

export function FeedItem({ item }: { item: Story }) {
  const { settings } = useSettings();
  const hasUrl = item.url.indexOf('http') === 0;
  const isJob = item.type === 'job';
  return <div className="item-block feed-item">
    <div style={{ marginBottom: settings.listSpacing + 'px' }}>
      <p>{hasUrl ? <>
        <a className="title" style={{ fontSize: settings.titleFontSize + 'px' }} href={item.url}
          target={settings.openLinkInNewTab ? '_blank' : undefined} rel={settings.openLinkInNewTab ? 'noopener' : undefined}>{item.title}</a>
        {item.domain && <> <span className="domain">({item.domain})</span></>}
      </> : <Link className="title" style={{ fontSize: settings.titleFontSize + 'px' }} to={`/item/${item.id}`}>{item.title}</Link>}</p>
      <div className="subtext-palm">
        {!isJob && <div className="details">
          <span className="name"><Link to={`/user/${item.user}`}>{item.user}</Link></span>
          <span className="right">{item.points} ★</span>
        </div>}
        <div className="details">{item.time_ago}
          {!isJob && <Link to={`/item/${item.id}`} className="comment-number"> • {formatCommentCount(item.comments_count)}</Link>}
        </div>
      </div>
      <div className="subtext-laptop">
        {!isJob && <span>{item.points} points by <Link to={`/user/${item.user}`}>{item.user}</Link></span>}
        <span className={!isJob ? 'item-details' : undefined}>{item.time_ago}
          {!isJob && <span> | <Link to={`/item/${item.id}`}>{formatCommentCount(item.comments_count)}</Link></span>}
        </span>
      </div>
    </div>
  </div>;
}
