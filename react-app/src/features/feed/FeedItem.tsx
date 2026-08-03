import { Link } from 'react-router-dom';

import type { Story } from '../../shared/models/story';
import { useSettings } from '../../shared/settings/useSettings';
import { formatCommentCount } from '../../shared/utils/comment-count';
import './FeedItem.scss';

interface FeedItemProps {
    item: Story;
}

export default function FeedItem({ item }: FeedItemProps) {
    const settings = useSettings();
    const hasUrl = item.url?.indexOf('http') === 0;
    const isJob = item.type === 'job';
    const externalLinkProps = settings.openLinkInNewTab ? { target: '_blank', rel: 'noopener' } : {};

    return (
        <div style={{ marginBottom: `${settings.listSpacing}px` }}>
            {hasUrl ? (
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
                            {' • '}
                            {formatCommentCount(item.comments_count)}
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
                            {' | '}
                            <Link to={`/item/${item.id}`}>{formatCommentCount(item.comments_count)}</Link>
                        </span>
                    )}
                </span>
            </div>
        </div>
    );
}
