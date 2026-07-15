import { NavLink } from 'react-router-dom';
import type { Story } from '../../models/story';
import { useSettings } from '../../context/SettingsContext';
import { commentPipe } from '../../utils/commentPipe';

export function Item({ item }: { item: Story }) {
  const { settings } = useSettings();
  const hasUrl = item.url.indexOf('http') === 0;

  const target = settings.openLinkInNewTab ? '_blank' : undefined;
  const rel = settings.openLinkInNewTab ? 'noopener' : undefined;

  return (
    <div style={{ marginBottom: settings.listSpacing + 'px' }}>
      {hasUrl ? (
        <p>
          <a
            className="title"
            style={{ fontSize: settings.titleFontSize + 'px' }}
            href={item.url}
            target={target}
            rel={rel}
          >
            {item.title}
          </a>
          {item.domain && (
            <>
              {' '}
              <span className="domain">({item.domain})</span>
            </>
          )}
        </p>
      ) : (
        <p>
          <NavLink className="title" style={{ fontSize: settings.titleFontSize + 'px' }} to={`/item/${item.id}`}>
            {item.title}
          </NavLink>
        </p>
      )}
      <div className="subtext-palm">
        {item.type !== 'job' && (
          <div className="details">
            <span className="name">
              <NavLink to={`/user/${item.user}`}>{item.user}</NavLink>
            </span>
            <span className="right">{item.points} ★</span>
          </div>
        )}
        <div className="details">
          {item.time_ago}
          {item.type !== 'job' && (
            <NavLink to={`/item/${item.id}`} className="comment-number">
              {' '}
              • {commentPipe(item.comments_count)}
            </NavLink>
          )}
        </div>
      </div>
      <div className="subtext-laptop">
        {item.type !== 'job' && (
          <span>
            {item.points} points by <NavLink to={`/user/${item.user}`}>{item.user}</NavLink>
          </span>
        )}
        {item.type !== 'job' && ' '}
        <span className={item.type !== 'job' ? 'item-details' : undefined}>
          {item.time_ago}
          {item.type !== 'job' && (
            <span>
              {' '}
              | <NavLink to={`/item/${item.id}`}>{commentPipe(item.comments_count)}</NavLink>
            </span>
          )}
        </span>
      </div>
    </div>
  );
}
