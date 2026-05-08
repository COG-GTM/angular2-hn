import { Link } from 'react-router-dom';
import { Story } from '../../models/story';
import './FeedItem.scss';

interface FeedItemProps {
  story: Story;
  index: number;
  openInNewTab: boolean;
  titleFontSize: string;
  listSpacing: string;
}

export default function FeedItem({ story, index, openInNewTab, titleFontSize, listSpacing }: FeedItemProps) {
  const linkTarget = openInNewTab ? '_blank' : '_self';
  const titleStyle = { fontSize: `${titleFontSize}px` };
  const itemStyle = { marginBottom: `${listSpacing}px` };

  return (
    <li className="item" style={itemStyle}>
      <div className="item-content">
        <span className="index">{index}.</span>
        <div className="item-main">
          <div className="item-title" style={titleStyle}>
            {story.url ? (
              <a href={story.url} target={linkTarget} rel="noopener noreferrer">
                {story.title}
              </a>
            ) : (
              <Link to={`/item/${story.id}`}>{story.title}</Link>
            )}
            {story.domain && <span className="domain">({story.domain})</span>}
          </div>
          {story.type !== 'job' ? (
            <div className="subtext">
              <span className="subtext-laptop">
                {story.points} points by{' '}
                <Link to={`/user/${story.user}`}>{story.user}</Link> {story.time_ago}{' '}
                | <Link to={`/item/${story.id}`}>{story.comments_count} comments</Link>
              </span>
              <span className="subtext-palm">
                {story.points} points by{' '}
                <Link to={`/user/${story.user}`}>{story.user}</Link> {story.time_ago}
                <br />
                <Link to={`/item/${story.id}`}>{story.comments_count} comments</Link>
              </span>
            </div>
          ) : (
            <div className="subtext">
              <span>{story.time_ago}</span>
              {story.domain && <span> | <a href={story.url}>{story.domain}</a></span>}
            </div>
          )}
        </div>
      </div>
    </li>
  );
}
