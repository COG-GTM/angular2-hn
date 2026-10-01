import { Link } from 'react-router';
import type { Story } from '../api/types';
import { useSettings } from '../hooks/useSettings';
import './StoryItem.css';

// Inlined port of the Angular `comment` pipe; deduplicate with utils/ once T6 lands.
function commentLabel(count: number): string {
  if (count > 0) {
    return `${count} ${count === 1 ? 'comment' : 'comments'}`;
  }
  return 'discuss';
}

export interface StoryItemProps {
  story: Story;
}

/** Port of feeds/item/item.component. */
export function StoryItem({ story }: StoryItemProps) {
  const { settings } = useSettings();
  const isJob = story.type === 'job';
  const hasUrl = story.url.indexOf('http') === 0;
  const titleStyle = { fontSize: `${settings.titleFontSize}px` };
  const newTab = settings.openLinkInNewTab ? { target: '_blank', rel: 'noopener' } : {};
  const userLink = story.user ? <Link to={`/user/${story.user}`}>{story.user}</Link> : null;
  const comments = commentLabel(story.comments_count);

  return (
    <div className="story-item" style={{ marginBottom: `${settings.listSpacing}px` }}>
      {hasUrl ? (
        <p>
          <a className="title" style={titleStyle} href={story.url} {...newTab}>
            {story.title}
          </a>
          {story.domain && <span className="domain"> ({story.domain})</span>}
        </p>
      ) : (
        <p>
          <Link className="title" style={titleStyle} to={`/item/${story.id}`}>
            {story.title}
          </Link>
        </p>
      )}
      <div className="subtext-palm">
        {!isJob && (
          <div className="details">
            <span className="name">{userLink}</span>
            <span className="right">{story.points} ★</span>
          </div>
        )}
        <div className="details">
          {story.time_ago}
          {!isJob && (
            <Link to={`/item/${story.id}`} className="comment-number">
              {' • '}
              {comments}
            </Link>
          )}
        </div>
      </div>
      <div className="subtext-laptop">
        {!isJob && (
          <span>
            {story.points} points by {userLink}{' '}
          </span>
        )}
        <span className={isJob ? undefined : 'item-details'}>
          {story.time_ago}
          {!isJob && (
            <span>
              {' | '}
              <Link to={`/item/${story.id}`}>{comments}</Link>
            </span>
          )}
        </span>
      </div>
    </div>
  );
}
