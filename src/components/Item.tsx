import { Link } from 'react-router-dom';
import type { Story } from '../models';
import { useSettings } from '../context/settingsContext';
import { commentCount } from '../utils/comment';
import { hasUrl } from '../utils/hasUrl';

export function Item({ item }: { item: Story }) {
    const { settings } = useSettings();
    const titleStyle = { fontSize: `${settings.titleFontSize}px` };
    const isJob = item.type === 'job';

    return (
        <div style={{ marginBottom: `${settings.listSpacing}px` }}>
            {hasUrl(item.url) ? (
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
                <span className={isJob ? undefined : 'item-details'}>
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
    );
}
