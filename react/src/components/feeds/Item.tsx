import { NavLink } from 'react-router-dom';

import type { Story } from '../../models';
import { useSettings } from '../../settings/SettingsContext';
import { commentCount } from '../../utils/commentCount';
import './Item.scss';

function activeClass(base?: string) {
    return ({ isActive }: { isActive: boolean }) => [base, isActive ? 'active' : null].filter(Boolean).join(' ');
}

export function Item({ item }: { item: Story }) {
    const { settings } = useSettings();
    const hasUrl = typeof item.url === 'string' && item.url.indexOf('http') === 0;
    const isJob = item.type === 'job';

    return (
        <div style={{ marginBottom: `${settings.listSpacing}px` }}>
            {hasUrl ? (
                <p>
                    <a
                        className="title"
                        style={{ fontSize: `${settings.titleFontSize}px` }}
                        href={item.url}
                        target={settings.openLinkInNewTab ? '_blank' : undefined}
                        rel={settings.openLinkInNewTab ? 'noopener' : undefined}
                    >
                        {item.title}
                    </a>{' '}
                    {item.domain && <span className="domain">({item.domain})</span>}
                </p>
            ) : (
                <p>
                    <NavLink
                        className={activeClass('title')}
                        style={{ fontSize: `${settings.titleFontSize}px` }}
                        to={`/item/${item.id}`}
                    >
                        {item.title}
                    </NavLink>
                </p>
            )}
            <div className="subtext-palm">
                {!isJob && (
                    <div className="details">
                        <span className="name">
                            <NavLink className={activeClass()} to={`/user/${item.user}`}>
                                {item.user}
                            </NavLink>
                        </span>
                        <span className="right">{item.points} ★</span>
                    </div>
                )}
                <div className="details">
                    {item.time_ago}
                    {!isJob && (
                        <NavLink className={activeClass('comment-number')} to={`/item/${item.id}`}>
                            {' • '}
                            {commentCount(item.comments_count)}
                        </NavLink>
                    )}
                </div>
            </div>
            <div className="subtext-laptop">
                {!isJob && (
                    <span>
                        {item.points} points by <NavLink className={activeClass()} to={`/user/${item.user}`}>{item.user}</NavLink>
                    </span>
                )}{' '}
                <span className={isJob ? undefined : 'item-details'}>
                    {item.time_ago}
                    {!isJob && (
                        <span>
                            {' | '}
                            <NavLink className={activeClass()} to={`/item/${item.id}`}>
                                {commentCount(item.comments_count)}
                            </NavLink>
                        </span>
                    )}
                </span>
            </div>
        </div>
    );
}
