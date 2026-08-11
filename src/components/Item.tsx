import { Link } from 'react-router-dom';

import { useSettings } from '../context/SettingsContext';
import { Story } from '../models';
import { formatCommentCount } from '../utils/formatCommentCount';
import './Item.scss';

export function hasUrl(story: Story): boolean {
    return story.url.indexOf('http') === 0;
}

export default function Item({ item }: { item: Story }) {
    const { settings } = useSettings();
    const externalLinkProps = settings.openLinkInNewTab ? { target: '_blank', rel: 'noopener' } : {};

    return (
        <div className="story-item">
            <div style={{ marginBottom: `${settings.listSpacing}px` }}>
                {hasUrl(item) ? (
                    <p>
                        <a
                            className="title"
                            style={{ fontSize: `${settings.titleFontSize}px` }}
                            href={item.url}
                            {...externalLinkProps}
                        >
                            {item.title}
                        </a>
                        {item.domain && <span className="domain">({item.domain})</span>}
                    </p>
                ) : (
                    <p>
                        <Link className="title" style={{ fontSize: `${settings.titleFontSize}px` }} to={`/item/${item.id}`}>
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
                                &bull; {formatCommentCount(item.comments_count)}
                            </Link>
                        )}
                    </div>
                </div>
                <div className="subtext-laptop">
                    {item.type !== 'job' && (
                        <span>
                            {item.points} points by <Link to={`/user/${item.user}`}>{item.user}</Link>
                        </span>
                    )}
                    <span className={item.type !== 'job' ? 'item-details' : undefined}>
                        {item.time_ago}
                        {item.type !== 'job' && (
                            <span>
                                {' '}
                                | <Link to={`/item/${item.id}`}>{formatCommentCount(item.comments_count)}</Link>
                            </span>
                        )}
                    </span>
                </div>
            </div>
        </div>
    );
}
