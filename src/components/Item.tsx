import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { formatComment } from '../utils/formatComment';
import type { Story } from '../types/story';
import styles from './Item.module.scss';

interface ItemProps {
  item: Story;
}

export default function Item({ item }: ItemProps) {
  const { settings } = useSettings();
  const hasUrl = item.url && item.url.indexOf('http') === 0;

  return (
    <div style={{ marginBottom: `${settings.listSpacing}px` }}>
      {hasUrl ? (
        <p>
          <a
            className={styles.title}
            style={{ fontSize: `${settings.titleFontSize}px` }}
            href={item.url}
            target={settings.openLinkInNewTab ? '_blank' : undefined}
            rel={settings.openLinkInNewTab ? 'noopener' : undefined}
          >
            {item.title}
          </a>
          {item.domain && <span className={styles.domain}> ({item.domain})</span>}
        </p>
      ) : (
        <p>
          <Link
            className={styles.title}
            style={{ fontSize: `${settings.titleFontSize}px` }}
            to={`/item/${item.id}`}
          >
            {item.title}
          </Link>
        </p>
      )}
      <div className={`subtext-palm ${styles.subtextPalm}`}>
        {item.type !== 'job' && (
          <div className={styles.details}>
            <span className="name"><Link to={`/user/${item.user}`}>{item.user}</Link></span>
            <span className={styles.right}>{item.points} ★</span>
          </div>
        )}
        <div className={styles.details}>
          {item.time_ago}
          {item.type !== 'job' && (
            <Link to={`/item/${item.id}`} className="comment-number"> •{' '}
              {formatComment(item.comments_count)}
            </Link>
          )}
        </div>
      </div>
      <div className={`subtext-laptop ${styles.subtextLaptop}`}>
        {item.type !== 'job' && (
          <span>
            {item.points} points by{' '}
            <Link to={`/user/${item.user}`}>{item.user}</Link>
          </span>
        )}
        <span className={item.type !== 'job' ? styles.itemDetails : ''}>
          {item.time_ago}
          {item.type !== 'job' && (
            <span> |{' '}
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
