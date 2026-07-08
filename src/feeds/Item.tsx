import { Link } from 'react-router-dom';
import { Story } from '../shared/models/story';
import { useSettings } from '../context/SettingsContext';
import { commentCount } from '../shared/comment-count';
import './Item.scss';

export function Item({ item }: { item: Story }) {
    const { openLinkInNewTab, titleFontSize, listSpacing } = useSettings();
    const hasUrl = item.url.indexOf('http') === 0;

    return (
        <div style={{ marginBottom: `${listSpacing}px` }}>
            {hasUrl ? (
                <p>
                    <a
                        className="title"
                        style={{ fontSize: `${titleFontSize}px` }}
                        href={item.url}
                        target={openLinkInNewTab ? '_blank' : undefined}
                        rel={openLinkInNewTab ? 'noopener' : undefined}
                    >
                        {item.title}
                    </a>
                    {item.domain && <span className="domain">({item.domain})</span>}
                </p>
            ) : (
                <p>
                    <Link className="title" style={{ fontSize: `${titleFontSize}px` }} to={`/item/${item.id}`}>
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
                            • {commentCount(item.comments_count)}
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
                            | <Link to={`/item/${item.id}`}>{commentCount(item.comments_count)}</Link>
                        </span>
                    )}
                </span>
            </div>
        </div>
    );
}
