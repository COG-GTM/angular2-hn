import { Link } from 'react-router-dom';

import { useSettings } from '../context/SettingsContext';
import type { Story } from '../models/story';
import { formatCommentCount } from '../utils/formatCommentCount';

import './Item.scss';

export interface ItemProps {
    item: Story;
}

export function hasUrl(item: Story): boolean {
    return typeof item.url === 'string' && item.url.indexOf('http') === 0;
}

export default function Item({ item }: ItemProps) {
    const { settings } = useSettings();

    const isJob = item.type === 'job';
    const titleStyle = { fontSize: `${settings.titleFontSize}px` };

    return (
        <div style={{ marginBottom: `${settings.listSpacing}px` }}>
            {hasUrl(item) ? (
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
                    {item.time_ago}
                    {!isJob && (
                        <Link to={`/item/${item.id}`} className="comment-number">
                            {' '}
                            • {formatCommentCount(item.comments_count)}
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
                    {item.time_ago}
                    {!isJob && (
                        <span>
                            {' '}
                            | <Link to={`/item/${item.id}`}>{formatCommentCount(item.comments_count)}</Link>
                        </span>
                    )}
                </span>
            </div>
        </div>
    );
}
