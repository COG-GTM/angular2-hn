import { Link } from 'react-router-dom';

import { Story } from '../shared/models/story';
import { useSettings } from '../shared/settings/settings-context';
import { formatCommentCount } from '../shared/utils/comment';
import './Item.scss';

export function Item({ story }: { story: Story }) {
    const { settings } = useSettings();
    const hasUrl = story.url.indexOf('http') === 0;
    const target = settings.openLinkInNewTab ? '_blank' : undefined;
    const rel = settings.openLinkInNewTab ? 'noopener' : undefined;

    return (
        <div className="item-block item-post" style={{ marginBottom: `${settings.listSpacing}px` }}>
            {hasUrl ? (
                <p>
                    <a
                        className="title"
                        style={{ fontSize: `${settings.titleFontSize}px` }}
                        href={story.url}
                        target={target}
                        rel={rel}
                    >
                        {story.title}
                    </a>
                    {story.domain && <span className="domain">({story.domain})</span>}
                </p>
            ) : (
                <p>
                    <Link className="title" style={{ fontSize: `${settings.titleFontSize}px` }} to={`/item/${story.id}`}>
                        {story.title}
                    </Link>
                </p>
            )}
            <div className="subtext-palm">
                {story.type !== 'job' && (
                    <div className="details">
                        <span className="name">
                            <Link to={`/user/${story.user}`}>{story.user}</Link>
                        </span>
                        <span className="right">{story.points} ★</span>
                    </div>
                )}
                <div className="details">
                    {story.time_ago}
                    {story.type !== 'job' && (
                        <Link to={`/item/${story.id}`} className="comment-number">
                            {' • '}
                            {formatCommentCount(story.comments_count)}
                        </Link>
                    )}
                </div>
            </div>
            <div className="subtext-laptop">
                {story.type !== 'job' && (
                    <span>
                        {story.points} points by <Link to={`/user/${story.user}`}>{story.user}</Link>
                    </span>
                )}
                <span className={story.type !== 'job' ? 'item-details' : undefined}>
                    {story.time_ago}
                    {story.type !== 'job' && (
                        <span>
                            {' | '}
                            <Link to={`/item/${story.id}`}>{formatCommentCount(story.comments_count)}</Link>
                        </span>
                    )}
                </span>
            </div>
        </div>
    );
}
