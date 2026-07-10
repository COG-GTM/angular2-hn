import { CSSProperties } from 'react';
import { Link } from 'react-router-dom';

import { useSettings } from '../../context/SettingsContext';
import { Story } from '../../types/story';
import { formatCommentCount } from '../../utils/formatCommentCount';
import '../../styles/item.scss';

interface ItemProps {
  item: Story;
}

export default function Item({ item }: ItemProps) {
  const { settings } = useSettings();
  const hasUrl = !!item.url && item.url.indexOf('http') === 0;

  const wrapperStyle: CSSProperties = {
    marginBottom: `${settings.listSpacing}px`,
  };
  const titleStyle: CSSProperties = {
    fontSize: `${settings.titleFontSize}px`,
  };
  const target = settings.openLinkInNewTab ? '_blank' : undefined;
  const rel = settings.openLinkInNewTab ? 'noopener' : undefined;

  return (
    <div className="item-block" style={wrapperStyle}>
      {hasUrl ? (
        <p>
          <a
            className="title"
            style={titleStyle}
            href={item.url}
            target={target}
            rel={rel}
          >
            {item.title}
          </a>
          {item.domain ? (
            <span className="domain"> ({item.domain})</span>
          ) : null}
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
              {' '}
              • {formatCommentCount(item.comments_count)}
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
        <span className={item.type !== 'job' ? 'item-details' : undefined}>
          {' '}
          {item.time_ago}
          {item.type !== 'job' && (
            <span>
              {' '}
              |{' '}
              <Link to={`/item/${item.id}`}>
                {formatCommentCount(item.comments_count)}
              </Link>
            </span>
          )}
        </span>
      </div>
    </div>
  );
}
