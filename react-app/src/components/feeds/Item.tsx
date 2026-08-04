import { Link } from 'react-router-dom';

import { useSettings } from '../../context/SettingsContext';
import { Story } from '../../models';
import { commentCount } from '../../utils/comment';
import './Item.scss';

export interface ItemProps {
    item: Story;
    className?: string;
}

export default function Item({ item, className }: ItemProps) {
    const { settings } = useSettings();
    const hasUrl = item.url ? item.url.indexOf('http') === 0 : false;
    const isJob = item.type === 'job';

    return (
        <div className={className}>
            <div style={{ marginBottom: `${settings.listSpacing}px` }}>
                {hasUrl ? (
                    <p>
                        <a
                            className="title"
                            style={{ fontSize: `${settings.titleFontSize}px` }}
                            href={item.url}
                            target={settings.openLinkInNewTab ? '_blank' : undefined}
                            rel={settings.openLinkInNewTab ? 'noopener noreferrer' : undefined}
                        >
                            {item.title}
                        </a>
                        {item.domain && <span className="domain">({item.domain})</span>}
                    </p>
                ) : (
                    <p>
                        <Link
                            className="title"
                            style={{ fontSize: `${settings.titleFontSize}px` }}
                            to={`/item/${item.id}`}
                        >
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
                                • {commentCount(item.comments_count)}
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
                    <span className={!isJob ? 'item-details' : undefined}>
                        {item.time_ago}
                        {!isJob && (
                            <span>
                                {' '}
                                | <Link to={`/item/${item.id}`}>{commentCount(item.comments_count)}</Link>
                            </span>
                        )}
                    </span>
                </div>
            </div>
        </div>
    );
}
