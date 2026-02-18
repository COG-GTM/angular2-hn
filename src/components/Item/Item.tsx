import React from 'react';
import { Link } from 'react-router-dom';
import './Item.css';

export interface Story {
    id: number;
    title: string;
    points: number;
    user: string;
    time: number;
    time_ago: string;
    type: 'poll' | 'story' | 'job';
    url: string;
    domain: string;
    comments_count: number;
}

export interface Settings {
    openLinkInNewTab: boolean;
    titleFontSize: string;
    listSpacing: string;
}

interface ItemProps {
    item: Story;
    settings?: Settings;
}

const defaultSettings: Settings = {
    openLinkInNewTab: localStorage.getItem('openLinkInNewTab')
        ? JSON.parse(localStorage.getItem('openLinkInNewTab')!)
        : false,
    titleFontSize: localStorage.getItem('titleFontSize') || '16',
    listSpacing: localStorage.getItem('listSpacing') || '0',
};

function formatComments(count: number): string {
    if (count === 0) {
        return 'discuss';
    }
    if (count === 1) {
        return '1 comment';
    }
    return `${count} comments`;
}

const Item: React.FC<ItemProps> = ({ item, settings = defaultSettings }) => {
    const hasUrl = item.url && item.url.indexOf('http') === 0;

    return (
        <div className="item-root" style={{ marginBottom: `${settings.listSpacing}px` }}>
            {hasUrl ? (
                <p className="item-title-row">
                    <a
                        className="title"
                        style={{ fontSize: `${settings.titleFontSize}px` }}
                        href={item.url}
                        target={settings.openLinkInNewTab ? '_blank' : undefined}
                        rel={settings.openLinkInNewTab ? 'noopener' : undefined}
                    >
                        {item.title}
                    </a>
                    {item.domain && <span className="domain">({item.domain})</span>}
                </p>
            ) : (
                <p className="item-title-row">
                    <Link
                        className="title"
                        style={{ fontSize: `${settings.titleFontSize}px` }}
                        to={`/item/${item.id}`}
                    >
                        {item.title}
                    </Link>
                </p>
            )}

            {/* Mobile subtext */}
            <div className="subtext-palm">
                {item.type !== 'job' && (
                    <div className="details">
                        <span className="name">
                            <Link to={`/user/${item.user}`}>{item.user}</Link>
                        </span>
                        <span className="right">{item.points} &#9733;</span>
                    </div>
                )}
                <div className="details">
                    {item.time_ago}
                    {item.type !== 'job' && (
                        <Link to={`/item/${item.id}`} className="comment-number">
                            {' '}&bull; {formatComments(item.comments_count)}
                        </Link>
                    )}
                </div>
            </div>

            {/* Desktop subtext */}
            <div className="subtext-laptop">
                {item.type !== 'job' && (
                    <span>
                        {item.points} points by{' '}
                        <Link to={`/user/${item.user}`}>{item.user}</Link>
                    </span>
                )}
                <span className={item.type !== 'job' ? 'item-details' : ''}>
                    {item.time_ago}
                    {item.type !== 'job' && (
                        <span>
                            {' '}|{' '}
                            <Link to={`/item/${item.id}`}>
                                {formatComments(item.comments_count)}
                            </Link>
                        </span>
                    )}
                </span>
            </div>
        </div>
    );
};

export default Item;
