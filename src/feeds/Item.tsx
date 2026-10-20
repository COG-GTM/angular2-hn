import { Link } from 'react-router-dom';

import type { Story } from '../shared/models';
import { useSettingsStore } from '../shared/store/settings';
import { formatCommentCount } from '../shared/utils/comment';
import './Item.scss';

interface ItemProps {
    item: Story;
}

/** Port of the Angular `ItemComponent` (`<item class="item-block" [item]>` feed row). */
export function Item({ item }: ItemProps) {
    const openLinkInNewTab = useSettingsStore((state) => state.openLinkInNewTab);
    const titleFontSize = useSettingsStore((state) => state.titleFontSize);
    const listSpacing = useSettingsStore((state) => state.listSpacing);

    const hasUrl = item.url.indexOf('http') === 0;
    const isJob = item.type === 'job';
    const titleStyle = { fontSize: `${titleFontSize}px` };
    const commentCount = formatCommentCount(item.comments_count);

    return (
        <div className="app-item item-block">
            <div style={{ marginBottom: `${listSpacing}px` }}>
                {hasUrl ? (
                    <p>
                        <a
                            className="title"
                            style={titleStyle}
                            href={item.url}
                            target={openLinkInNewTab ? '_blank' : undefined}
                            rel={openLinkInNewTab ? 'noopener' : undefined}
                        >
                            {' '}
                            {item.title}{' '}
                        </a>
                        {item.domain && <span className="domain">({item.domain})</span>}
                    </p>
                ) : (
                    <p>
                        <Link className="title" style={titleStyle} to={`/item/${item.id}`}>
                            {' '}
                            {item.title}{' '}
                        </Link>
                    </p>
                )}
                <div className="subtext-palm">
                    {!isJob && (
                        <div className="details">
                            <span className="name">
                                {item.user && <Link to={`/user/${item.user}`}>{item.user}</Link>}
                            </span>
                            <span className="right">{item.points} ★</span>
                        </div>
                    )}
                    <div className="details">
                        {item.time_ago}
                        {!isJob && (
                            <Link to={`/item/${item.id}`} className="comment-number">
                                {' '}• {commentCount}
                            </Link>
                        )}
                    </div>
                </div>
                <div className="subtext-laptop">
                    {!isJob && (
                        <span>
                            {item.points} points by {item.user && <Link to={`/user/${item.user}`}>{item.user}</Link>}
                        </span>
                    )}
                    <span className={!isJob ? 'item-details' : undefined}>
                        {item.time_ago}
                        {!isJob && (
                            <span>
                                {' '}| <Link to={`/item/${item.id}`}>{commentCount}</Link>
                            </span>
                        )}
                    </span>
                </div>
            </div>
        </div>
    );
}
