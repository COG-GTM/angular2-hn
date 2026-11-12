import { NavLink } from 'react-router';

import type { Story } from '../shared/models/story';
import { useSettings } from '../shared/settings/useSettings';
import { formatCommentCount } from '../shared/utils/comment';
import { hasExternalUrl } from '../shared/utils/has-url';
import './Item.scss';

export function Item({ item }: { item: Story }) {
    const { settings } = useSettings();
    const titleStyle = { fontSize: `${settings.titleFontSize}px` };
    const isJob = item.type === 'job';

    return (
        <div className="app-item item-block">
            <div style={{ marginBottom: `${settings.listSpacing}px` }}>
                {hasExternalUrl(item.url) ? (
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
                        <NavLink className="title" style={titleStyle} to={`/item/${item.id}`}>
                            {item.title}
                        </NavLink>
                    </p>
                )}
                <div className="subtext-palm">
                    {!isJob && (
                        <div className="details">
                            <span className="name">
                                <NavLink to={`/user/${item.user}`}>{item.user}</NavLink>
                            </span>
                            <span className="right">{item.points} ★</span>
                        </div>
                    )}
                    <div className="details">
                        {item.time_ago}
                        {!isJob && (
                            <NavLink to={`/item/${item.id}`} className="comment-number">
                                {' '}
                                • {formatCommentCount(item.comments_count)}
                            </NavLink>
                        )}
                    </div>
                </div>
                <div className="subtext-laptop">
                    {!isJob && (
                        <span>
                            {item.points} points by <NavLink to={`/user/${item.user}`}>{item.user}</NavLink>
                        </span>
                    )}
                    <span className={isJob ? undefined : 'item-details'}>
                        {item.time_ago}
                        {!isJob && (
                            <span>
                                {' '}
                                | <NavLink to={`/item/${item.id}`}>{formatCommentCount(item.comments_count)}</NavLink>
                            </span>
                        )}
                    </span>
                </div>
            </div>
        </div>
    );
}
