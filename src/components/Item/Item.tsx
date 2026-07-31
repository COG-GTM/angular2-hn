import { Link } from 'react-router';

import { useSettings } from '../../context/settingsContext';
import { Story } from '../../types';
import { formatCommentCount } from '../../utils/formatCommentCount';

import './Item.scss';

export function Item({ item }: { item: Story }) {
    const { settings } = useSettings();

    const hasUrl = item.url?.startsWith('http') ?? false;
    const isJob = item.type === 'job';
    const linkTarget = settings.openLinkInNewTab ? { target: '_blank', rel: 'noopener noreferrer' } : {};
    const titleStyle = { fontSize: `${settings.titleFontSize}px` };

    return (
        <div className="item-block" style={{ marginBottom: `${settings.listSpacing}px` }}>
            {hasUrl ? (
                <p>
                    <a className="title" style={titleStyle} href={item.url} {...linkTarget}>
                        {item.title}
                    </a>
                    {item.domain && (
                        <>
                            {' '}
                            <span className="domain">({item.domain})</span>
                        </>
                    )}
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
