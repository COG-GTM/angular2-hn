import { Link, NavLink } from 'react-router-dom';

import { useSettings } from '../../context/SettingsContext';
import type { Story } from '../../models/story';
import { formatCommentCount } from '../../utils/format-comment-count';

import './Item.scss';

export interface ItemProps {
    item: Story;
}

export function hasUrl(item: Story): boolean {
    return item.url?.startsWith('http') ?? false;
}

function activeClass({ isActive }: { isActive: boolean }) {
    return isActive ? 'active' : '';
}

export default function Item({ item }: ItemProps) {
    const { settings } = useSettings();
    const titleStyle = { fontSize: `${settings.titleFontSize}px` };
    const newTabProps = settings.openLinkInNewTab
        ? { target: '_blank', rel: 'noopener' }
        : {};

    return (
        <div style={{ marginBottom: `${settings.listSpacing}px` }}>
            {hasUrl(item) ? (
                <p>
                    <a className="title" style={titleStyle} href={item.url} {...newTabProps}>
                        {item.title}
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
                {item.type !== 'job' && (
                    <div className="details">
                        <span>
                            <NavLink to={`/user/${item.user}`} className={activeClass}>
                                {item.user}
                            </NavLink>
                        </span>
                        <span className="right">{item.points} ★</span>
                    </div>
                )}
                <div className="details">
                    {item.time_ago}
                    {item.type !== 'job' && (
                        <NavLink
                            to={`/item/${item.id}`}
                            className={({ isActive }) =>
                                isActive ? 'comment-number active' : 'comment-number'
                            }
                        >
                            {' '}
                            • {formatCommentCount(item.comments_count)}
                        </NavLink>
                    )}
                </div>
            </div>
            <div className="subtext-laptop">
                {item.type !== 'job' && (
                    <span>
                        {item.points} points by{' '}
                        <NavLink to={`/user/${item.user}`} className={activeClass}>
                            {item.user}
                        </NavLink>
                    </span>
                )}
                <span className={item.type !== 'job' ? 'item-details' : undefined}>
                    {item.time_ago}
                    {item.type !== 'job' && (
                        <span>
                            {' '}
                            |{' '}
                            <NavLink to={`/item/${item.id}`} className={activeClass}>
                                {formatCommentCount(item.comments_count)}
                            </NavLink>
                        </span>
                    )}
                </span>
            </div>
        </div>
    );
}
