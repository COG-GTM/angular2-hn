import React from 'react';

interface Story {
  id: number;
  title: string;
  points: number;
  user: string;
  time: number;
  time_ago: number;
  type: string;
  url: string;
  domain: string;
  comments: any[];
  comments_count: number;
  poll: any[];
  poll_votes_count: number;
  deleted: boolean;
  dead: boolean;
}

interface Settings {
  showSettings: boolean;
  openLinkInNewTab: boolean;
  theme: string;
  titleFontSize: string;
  listSpacing: string;
}

interface ItemComponentProps {
  item: Story;
  settings: Settings;
}

const formatCommentCount = (count: number): string => {
  if (count > 0) {
    const suffix = count === 1 ? 'comment' : 'comments';
    return `${count} ${suffix}`;
  }
  return 'discuss';
};

export const ItemComponent: React.FC<ItemComponentProps> = ({ item, settings }) => {
  const hasUrl = item.url.indexOf('http') === 0;


  return (
    <div style={{ marginBottom: `${settings.listSpacing}px` }}>
      {hasUrl && (
        <p>
          <a 
            className="title" 
            style={{ fontSize: `${settings.titleFontSize}px` }}
            href={item.url}
            target={settings.openLinkInNewTab ? '_blank' : undefined}
            rel={settings.openLinkInNewTab ? 'noopener' : undefined}
          >
            {item.title}
          </a>
          {item.domain && <span className="domain">({item.domain})</span>}
        </p>
      )}
      {!hasUrl && (
        <p>
          <a 
            className="title" 
            style={{ fontSize: `${settings.titleFontSize}px` }}
            href={`/item/${item.id}`}
          >
            {item.title}
          </a>
        </p>
      )}
      <div className="subtext-palm">
        {item.type !== 'job' && (
          <div className="details">
            <span className="name">
              <a href={`/user/${item.user}`}>{item.user}</a>
            </span>
            <span className="right">{item.points} ★</span>
          </div>
        )}
        <div className="details">
          {item.time_ago}
          {item.type !== 'job' && (
            <a href={`/item/${item.id}`} className="comment-number">
              {' • '}
              {formatCommentCount(item.comments_count)}
            </a>
          )}
        </div>
      </div>
      <div className="subtext-laptop">
        {item.type !== 'job' && (
          <span>
            {item.points} points by{' '}
            <a href={`/user/${item.user}`}>{item.user}</a>
          </span>
        )}
        <span className={item.type !== 'job' ? 'item-details' : ''}>
          {item.time_ago}
          {item.type !== 'job' && (
            <span>
              {' | '}
              <a href={`/item/${item.id}`}>
                {formatCommentCount(item.comments_count)}
              </a>
            </span>
          )}
        </span>
      </div>
    </div>
  );
};
