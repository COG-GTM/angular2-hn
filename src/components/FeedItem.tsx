import { Link } from 'react-router-dom';

import { useSettings } from '../context/SettingsContext';
import type { Story } from '../types';
import { formatCommentCount, hasExternalUrl } from '../utils';

export default function FeedItem({ item }: { item: Story }) {
    const { listSpacing, titleFontSize, openLinkInNewTab } = useSettings();
    const hasUrl = hasExternalUrl(item.url);

    const titleStyle = { fontSize: `${titleFontSize}px` };
    const linkTarget = openLinkInNewTab ? '_blank' : undefined;
    const linkRel = openLinkInNewTab ? 'noopener' : undefined;

    return (
        <div style={{ marginBottom: `${listSpacing}px` }}>
            {hasUrl ? (
                <p>
                    <a
                        className="title"
                        style={titleStyle}
                        href={item.url}
                        target={linkTarget}
                        rel={linkRel}
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
                {item.type !== 'job' && (
                    <div className="details">
                        <span className="name">
                            <Link to={`/user/${item.user}`}>{item.user}</Link>
                        </span>
                        <span className="right">{item.points} ★</span>
                    </div>
                )}
                <div className="details">
                    {item.time_ago}
                    {item.type !== 'job' && (
                        <Link to={`/item/${item.id}`} className="comment-number">
                            {' '}
                            • {formatCommentCount(item.comments_count)}
                        </Link>
                    )}
                </div>
            </div>

            <div className="subtext-laptop">
                {item.type !== 'job' && (
                    <span>
                        {item.points} points by{' '}
                        <Link to={`/user/${item.user}`}>{item.user}</Link>
                    </span>
                )}
                <span className={item.type !== 'job' ? 'item-details' : undefined}>
                    {item.time_ago}
                    {item.type !== 'job' && (
                        <span>
                            {' | '}
                            <Link to={`/item/${item.id}`}>
                                {formatCommentCount(item.comments_count)}
                            </Link>
                        </span>
                    )}
                </span>
            </div>
        </div>
    );
}
