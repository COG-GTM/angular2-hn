import { Link } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';
import type { Story } from '../../types/story';
import { formatCommentCount } from '../../utils/formatCommentCount';
import './Item.scss';

interface ItemProps {
  item: Story;
}

export default function Item({ item }: ItemProps) {
  const { settings } = useSettings();
  const hasUrl = item.url ? item.url.indexOf('http') === 0 : false;

  const linkTarget = settings.openLinkInNewTab ? '_blank' : undefined;
  const linkRel = settings.openLinkInNewTab ? 'noopener' : undefined;

  return (
    <div style={{ marginBottom: `${settings.listSpacing}px` }}>
      {hasUrl ? (
        <p>
          <a
            className="title"
            style={{ fontSize: `${settings.titleFontSize}px` }}
            href={item.url}
            target={linkTarget}
            rel={linkRel}
          >
            {item.title}
          </a>
          {item.domain ? <span className="domain"> ({item.domain})</span> : null}
        </p>
      ) : (
        <p>
          <Link
            to={`/item/${item.id}`}
            className="title"
            style={{ fontSize: `${settings.titleFontSize}px` }}
          >
            {item.title}
          </Link>
        </p>
      )}
      <div className="subtext-palm">
        {item.type !== 'job' ? (
          <div className="details">
            <span className="name">
              <Link to={`/user/${item.user}`}>{item.user}</Link>
            </span>
            <span className="right">{item.points} ★</span>
          </div>
        ) : null}
        <div className="details">
          {item.time_ago}
          {item.type !== 'job' ? (
            <Link to={`/item/${item.id}`} className="comment-number">
              {' • '}
              {formatCommentCount(item.comments_count)}
            </Link>
          ) : null}
        </div>
      </div>
      <div className="subtext-laptop">
        {item.type !== 'job' ? (
          <span>
            {item.points} points by{' '}
            <Link to={`/user/${item.user}`}>{item.user}</Link>
          </span>
        ) : null}
        <span className={item.type !== 'job' ? 'item-details' : undefined}>
          {item.time_ago}
          {item.type !== 'job' ? (
            <span>
              {' | '}
              <Link to={`/item/${item.id}`}>
                {formatCommentCount(item.comments_count)}
              </Link>
            </span>
          ) : null}
        </span>
      </div>
    </div>
  );
}
