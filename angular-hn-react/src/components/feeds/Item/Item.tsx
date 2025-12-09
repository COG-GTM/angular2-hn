import React from 'react';
import { Link } from 'react-router-dom';
import { Story } from '../../../types/story';
import { useSettings } from '../../../hooks/useSettings';
import './Item.css';

interface ItemProps {
    item: Story;
}

export const Item: React.FC<ItemProps> = ({ item }) => {
    const { settings } = useSettings();

    const hasUrl = item.url?.startsWith('http');

    return (
        <li className="item" style={{ marginBottom: `${settings.listSpacing}px` }}>
            <div className="item-title">
                {hasUrl ? (
                    <a
                        href={item.url}
                        target={settings.openLinkInNewTab ? '_blank' : undefined}
                        rel={settings.openLinkInNewTab ? 'noopener noreferrer' : undefined}
                        style={{ fontSize: `${settings.titleFontSize}px` }}
                    >
                        {item.title}
                    </a>
                ) : (
                    <Link to={`/item/${item.id}`} style={{ fontSize: `${settings.titleFontSize}px` }}>
                        {item.title}
                    </Link>
                )}
                {item.domain && <span className="domain">({item.domain})</span>}
            </div>
            <div className="item-meta">
                <span>{item.points} points</span>
                <span>
                    {' '}
                    by <Link to={`/user/${item.user}`}>{item.user}</Link>
                </span>
                <span> {item.time_ago}</span>
                <span>
                    {' '}
                    | <Link to={`/item/${item.id}`}>{item.comments_count || 0} comments</Link>
                </span>
            </div>
        </li>
    );
};
