import { Link } from 'react-router';

import type { Story } from '../../shared/models';
import { useSettings } from '../../shared/settings';
import { commentLabel } from '../../shared/utils';
import './FeedItem.scss';

export interface FeedItemProps {
    item: Story;
}

/** Angular `ItemComponent.hasUrl`: external links start with `http`; Ask/text posts use `item?id=…`. */
function hasExternalUrl(item: Story): boolean {
    return typeof item.url === 'string' && item.url.indexOf('http') === 0;
}

/** Port of Angular `feeds/item` (`<item>`): one feed entry with phone (`.subtext-palm`) and laptop subtexts. */
export function FeedItem({ item }: FeedItemProps) {
    const { settings } = useSettings();
    const isJob = item.type === 'job';
    const titleStyle = { fontSize: `${settings.titleFontSize}px` };
    const itemPath = `/item/${item.id}`;
    const userPath = `/user/${item.user}`;
    const comments = commentLabel(item.comments_count);

    return (
        <div className="feed-item item-block" data-testid="feed-item">
            <div style={{ marginBottom: `${settings.listSpacing}px` }}>
                {hasExternalUrl(item) ? (
                    <p>
                        <a
                            className="title"
                            style={titleStyle}
                            href={item.url}
                            target={settings.openLinkInNewTab ? '_blank' : undefined}
                            rel={settings.openLinkInNewTab ? 'noopener noreferrer' : undefined}
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
                        <Link className="title" style={titleStyle} to={itemPath}>
                            {item.title}
                        </Link>
                    </p>
                )}
                <div className="subtext-palm">
                    {!isJob && (
                        <div className="details">
                            <span className="name">
                                <Link to={userPath}>{item.user}</Link>
                            </span>
                            <span className="right">{item.points} ★</span>
                        </div>
                    )}
                    <div className="details">
                        {item.time_ago}
                        {!isJob && (
                            <>
                                {' '}
                                <Link to={itemPath} className="comment-number">
                                    • {comments}
                                </Link>
                            </>
                        )}
                    </div>
                </div>
                <div className="subtext-laptop">
                    {!isJob && (
                        <span>
                            {item.points} points by <Link to={userPath}>{item.user}</Link>
                        </span>
                    )}
                    <span className={isJob ? undefined : 'item-details'}>
                        {item.time_ago}
                        {!isJob && (
                            <span>
                                {' '}
                                | <Link to={itemPath}>{comments}</Link>
                            </span>
                        )}
                    </span>
                </div>
            </div>
        </div>
    );
}
