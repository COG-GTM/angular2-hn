import { Link } from 'react-router-dom';

import type { Story } from '../../shared/models';
import { useSettings } from '../../shared/settings';
import { commentLabel, isSafeHref } from '../../shared/utils';
import './FeedItem.scss';

export interface FeedItemProps {
    item: Story;
}

/** Port of Angular `ItemComponent` (`<item class="item-block">`): one row of the feed list. */
export function FeedItem({ item }: FeedItemProps) {
    const { settings } = useSettings();
    const hasUrl = typeof item.url === 'string' && /^https?:\/\//i.test(item.url) && isSafeHref(item.url);
    const isJob = item.type === 'job';
    const titleStyle = { fontSize: `${settings.titleFontSize}px` };
    const comments = commentLabel(item.comments_count);
    const userLink = <Link to={`/user/${item.user ?? ''}`}>{item.user}</Link>;

    return (
        <div className="feed-item item-block">
            <div style={{ marginBottom: `${settings.listSpacing}px` }}>
                {hasUrl ? (
                    <p>
                        <a
                            className="title"
                            style={titleStyle}
                            href={item.url}
                            target={settings.openLinkInNewTab ? '_blank' : undefined}
                            rel={settings.openLinkInNewTab ? 'noopener' : undefined}
                        >
                            {` ${item.title} `}
                        </a>
                        {item.domain && <span className="domain">({item.domain})</span>}
                    </p>
                ) : (
                    <p>
                        <Link className="title" style={titleStyle} to={`/item/${item.id}`}>
                            {` ${item.title} `}
                        </Link>
                    </p>
                )}
                <div className="subtext-palm">
                    {!isJob && (
                        <div className="details">
                            <span className="name">{userLink}</span>
                            <span className="right">{item.points} ★</span>
                        </div>
                    )}
                    <div className="details">
                        {` ${item.time_ago} `}
                        {!isJob && (
                            <Link to={`/item/${item.id}`} className="comment-number">
                                {` • ${comments} `}
                            </Link>
                        )}
                    </div>
                </div>
                <div className="subtext-laptop">
                    {!isJob && (
                        <span>
                            {` ${item.points} points by `}
                            {userLink}
                        </span>
                    )}
                    <span className={!isJob ? 'item-details' : undefined}>
                        {` ${item.time_ago} `}
                        {!isJob && (
                            <span>
                                {' | '}
                                <Link to={`/item/${item.id}`}>{` ${comments} `}</Link>
                            </span>
                        )}
                    </span>
                </div>
            </div>
        </div>
    );
}
