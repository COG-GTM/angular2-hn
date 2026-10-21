import { Link } from 'react-router';

import type { Story } from '../../shared/models';
import { useSettings } from '../../shared/settings';
import { commentLabel } from '../../shared/utils';
import { externalHref } from '../../shared/utils';
import './FeedItem.scss';

export interface FeedItemProps {
    item: Story;
}

/** Port of Angular `feeds/item` (the story row). */
export function FeedItem({ item }: FeedItemProps) {
    const { settings } = useSettings();
    const href = externalHref(item.url);
    const isJob = item.type === 'job';
    const titleStyle = { fontSize: `${settings.titleFontSize}px` };
    const newTab = settings.openLinkInNewTab ? { target: '_blank', rel: 'noopener noreferrer' } : {};
    const comments = commentLabel(item.comments_count);

    return (
        <div className="item-block">
            <div style={{ marginBottom: `${settings.listSpacing}px` }}>
                {href !== null ? (
                    <p>
                        <a className="title" style={titleStyle} href={href} {...newTab}>
                            {item.title}{' '}
                        </a>
                        {item.domain && <span className="domain">({item.domain})</span>}
                    </p>
                ) : (
                    <p>
                        <Link className="title" style={titleStyle} to={`/item/${item.id}`}>
                            {item.title}
                        </Link>
                    </p>
                )}
                <div className="subtext-palm">
                    {!isJob && (
                        <div className="details">
                            <span className="name">
                                <Link to={`/user/${item.user}`}>{item.user}</Link>
                            </span>
                            <span className="right">{item.points} ★</span>
                        </div>
                    )}
                    <div className="details">
                        {item.time_ago}{' '}
                        {!isJob && (
                            <Link to={`/item/${item.id}`} className="comment-number">
                                • {comments}
                            </Link>
                        )}
                    </div>
                </div>
                <div className="subtext-laptop">
                    {!isJob && (
                        <span>
                            {item.points} points by <Link to={`/user/${item.user}`}>{item.user}</Link>
                        </span>
                    )}
                    <span className={isJob ? undefined : 'item-details'}>
                        {' '}
                        {item.time_ago}{' '}
                        {!isJob && (
                            <span>
                                {'| '}
                                <Link to={`/item/${item.id}`}>{comments}</Link>
                            </span>
                        )}
                    </span>
                </div>
            </div>
        </div>
    );
}
