import { Link } from 'react-router-dom';
import { Story } from '../types/story';
import { useSettings } from '../contexts/SettingsContext';

interface ItemProps {
  item: Story;
}

export function Item({ item }: ItemProps) {
  const { settings } = useSettings();
  
  const hasUrl = item.url && item.url.indexOf('http') === 0;

  return (
    <div style={{ marginBottom: `${settings.listSpacing}px` }}>
      {hasUrl ? (
        <p>
          <a
            className="title hover:underline"
            style={{ fontSize: `${settings.titleFontSize}px` }}
            href={item.url}
            target={settings.openLinkInNewTab ? '_blank' : undefined}
            rel={settings.openLinkInNewTab ? 'noopener noreferrer' : undefined}
          >
            {item.title}
          </a>
          {item.domain && (
            <span className="domain text-gray-500 text-sm ml-1">({item.domain})</span>
          )}
        </p>
      ) : (
        <p>
          <Link
            className="title hover:underline"
            style={{ fontSize: `${settings.titleFontSize}px` }}
            to={`/item/${item.id}`}
          >
            {item.title}
          </Link>
        </p>
      )}
      
      <div className="subtext-palm block md:hidden text-sm text-gray-600 dark:text-gray-400">
        {item.type !== 'job' && (
          <div className="details flex justify-between">
            <span className="name">
              <Link to={`/user/${item.user}`} className="hover:underline">
                {item.user}
              </Link>
            </span>
            <span className="right">{item.points} ★</span>
          </div>
        )}
        <div className="details">
          {item.time_ago}
          {item.type !== 'job' && (
            <Link to={`/item/${item.id}`} className="comment-number hover:underline">
              {' • '}
              {item.comments_count === 0
                ? 'discuss'
                : item.comments_count === 1
                ? '1 comment'
                : `${item.comments_count} comments`}
            </Link>
          )}
        </div>
      </div>

      <div className="subtext-laptop hidden md:block text-sm text-gray-600 dark:text-gray-400">
        {item.type !== 'job' && (
          <span>
            {item.points} points by{' '}
            <Link to={`/user/${item.user}`} className="hover:underline">
              {item.user}
            </Link>
          </span>
        )}
        <span className={item.type !== 'job' ? 'item-details ml-2' : ''}>
          {item.time_ago}
          {item.type !== 'job' && (
            <span>
              {' | '}
              <Link to={`/item/${item.id}`} className="hover:underline">
                {item.comments_count === 0
                  ? 'discuss'
                  : item.comments_count === 1
                  ? '1 comment'
                  : `${item.comments_count} comments`}
              </Link>
            </span>
          )}
        </span>
      </div>
    </div>
  );
}
