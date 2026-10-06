import { Link } from 'react-router-dom';
import type { Story } from '../shared/models';
import { useSettings } from '../shared/services/useSettings';
import { formatCommentCount } from '../shared/utils/comment';
import './FeedItem.scss';

export interface FeedItemProps {
    item: Story;
}

/** Port of Angular's ItemComponent (src/app/feeds/item): one story row in a feed. */
export function FeedItem({ item }: FeedItemProps) {
    const { settings } = useSettings();
    const hasUrl = item.url?.startsWith('http') ?? false;
    const isJob = item.type === 'job';
    const titleStyle = { fontSize: `${settings.titleFontSize}px` };
    const itemLink = `/item/${item.id}`;
    const userLink = `/user/${item.user}`;
    const commentCount = formatCommentCount(item.comments_count ?? 0);

    return (
        <div className="feed-item item-block" style={{ marginBottom: `${settings.listSpacing}px` }}>
            {hasUrl ? (
                <p>
                    <a
                        className="title"
                        style={titleStyle}
                        href={item.url}
                        target={settings.openLinkInNewTab ? '_blank' : undefined}
                        rel={settings.openLinkInNewTab ? 'noopener' : undefined}
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
                    <Link className="title" style={titleStyle} to={itemLink}>
                        {item.title}
                    </Link>
                </p>
            )}
            <div className="subtext-palm">
                {!isJob && (
                    <div className="details">
                        <span className="name">
                            <Link to={userLink}>{item.user}</Link>
                        </span>
                        <span className="right">{item.points} ★</span>
                    </div>
                )}
                <div className="details">
                    {item.time_ago}
                    {!isJob && (
                        <Link to={itemLink} className="comment-number">
                            {' '}
                            • {commentCount}
                        </Link>
                    )}
                </div>
            </div>
            <div className="subtext-laptop">
                {!isJob && (
                    <span>
                        {item.points} points by <Link to={userLink}>{item.user}</Link>{' '}
                    </span>
                )}
                <span className={isJob ? undefined : 'item-details'}>
                    {item.time_ago}
                    {!isJob && (
                        <span>
                            {' | '}
                            <Link to={itemLink}>{commentCount}</Link>
                        </span>
                    )}
                </span>
            </div>
        </div>
    );
}
