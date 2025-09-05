import { Link } from 'react-router-dom';
import { Story } from '../../types';
import { useSettings } from '../../contexts/SettingsContext';

interface StoryItemProps {
  story: Story;
  index: number;
}

export function StoryItem({ story, index }: StoryItemProps) {
  const { settings } = useSettings();

  const linkTarget = settings.openLinkInNewTab ? '_blank' : '_self';
  const linkRel = settings.openLinkInNewTab ? 'noopener noreferrer' : undefined;

  return (
    <div 
      className="flex p-2 border-b border-gray-200 last:border-b-0 items-start gap-2" 
      style={{ 
        fontSize: `${settings.titleFontSize}px`, 
        marginBottom: `${settings.listSpacing}px` 
      }}
    >
      <div className="text-gray-600 text-xs min-w-5 text-right mt-0.5">{index}.</div>
      <div className="flex-1">
        <div className="mb-1">
          {story.url ? (
            <a 
              href={story.url} 
              target={linkTarget} 
              rel={linkRel}
              className="text-black no-underline text-sm hover:underline"
            >
              {story.title}
            </a>
          ) : (
            <Link to={`/item/${story.id}`} className="text-black no-underline text-sm hover:underline">
              {story.title}
            </Link>
          )}
          {story.domain && (
            <span className="text-gray-600 text-xs"> ({story.domain})</span>
          )}
        </div>
        <div className="text-xs text-gray-600">
          {story.points} points by{' '}
          <Link to={`/user/${story.user}`} className="text-gray-600 no-underline hover:underline">
            {story.user}
          </Link>{' '}
          {story.time_ago} |{' '}
          <Link to={`/item/${story.id}`} className="text-gray-600 no-underline hover:underline">
            {story.comments_count} comments
          </Link>
        </div>
      </div>
    </div>
  );
}
