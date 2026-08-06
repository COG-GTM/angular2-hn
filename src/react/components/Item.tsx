import * as React from 'react';
import { NavLink } from 'react-router-dom';

import { Story } from '../../app/shared/models/story';
import { useSettings } from '../context/SettingsContext';
import { formatCommentCount } from '../utils/formatCommentCount';

export interface ItemProps {
    item: Story;
}

// ngOnInit() in ItemComponent has an empty body, so there is no useEffect equivalent to add here.
export const Item = ({ item }: ItemProps) => {
    const settings = useSettings();
    const hasUrl = item.url.indexOf('http') === 0;
    const isJob = item.type === 'job';
    const titleStyle = { fontSize: `${settings.titleFontSize}px` };
    const linkClass = (staticClass = '') => ({ isActive }: { isActive: boolean }) =>
        [staticClass, isActive ? 'active' : ''].filter(Boolean).join(' ');
    const activeClass = linkClass();

    return (
        <div style={{ marginBottom: `${settings.listSpacing}px` }}>
            {hasUrl && (
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
                    {item.domain && <span className="domain">({item.domain})</span>}
                </p>
            )}
            {!hasUrl && (
                <p>
                    <NavLink className={linkClass('title')} style={titleStyle} to={`/item/${item.id}`}>
                        {item.title}
                    </NavLink>
                </p>
            )}
            <div className="subtext-palm">
                {!isJob && (
                    <div className="details">
                        <span className="name">
                            <NavLink className={activeClass} to={`/user/${item.user}`}>
                                {item.user}
                            </NavLink>
                        </span>
                        <span className="right">{item.points} ★</span>
                    </div>
                )}
                <div className="details">
                    {item.time_ago}
                    {!isJob && (
                        <NavLink to={`/item/${item.id}`} className={linkClass('comment-number')}>
                            {' '}
                            • {formatCommentCount(item.comments_count)}
                        </NavLink>
                    )}
                </div>
            </div>
            <div className="subtext-laptop">
                {!isJob && (
                    <span>
                        {item.points} points by{' '}
                        <NavLink className={activeClass} to={`/user/${item.user}`}>
                            {item.user}
                        </NavLink>
                    </span>
                )}
                <span className={isJob ? undefined : 'item-details'}>
                    {item.time_ago}
                    {!isJob && (
                        <span>
                            {' '}
                            |{' '}
                            <NavLink className={activeClass} to={`/item/${item.id}`}>
                                {formatCommentCount(item.comments_count)}
                            </NavLink>
                        </span>
                    )}
                </span>
            </div>
        </div>
    );
};
