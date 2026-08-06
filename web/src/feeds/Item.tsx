import { NavLink } from 'react-router-dom';

import { useSettings } from '../context/SettingsContext';
import { Story } from '../models/story';
import { formatCommentCount } from '../utils/formatCommentCount';
import './item.scss';

export interface ItemProps {
    item: Story;
    className?: string;
}

export function Item({ item, className }: ItemProps) {
    const { settings } = useSettings();
    const hasUrl = item.url !== undefined && item.url.indexOf('http') === 0;
    const isJob = item.type === 'job';
    const titleStyle = { fontSize: `${settings.titleFontSize}px` };

    return (
        <div className={className}>
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
                            {item.title}
                        </a>
                        {item.domain && <span className="domain">({item.domain})</span>}
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

export default Item;
