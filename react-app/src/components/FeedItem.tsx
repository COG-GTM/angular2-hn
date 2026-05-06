import { Link } from 'react-router-dom';
import { type Story } from '../models';
import { useSettings } from '../services/SettingsContext';
import { formatCommentCount } from '../utils/commentPipe';
import '../styles/FeedItem.scss';

interface FeedItemProps {
    item: Story;
}

export default function FeedItem({ item }: FeedItemProps) {
    const { settings } = useSettings();
    const hasUrl = item.url && item.url.indexOf('http') === 0;

    return (
        <div className="feed-item-component" style={{ marginBottom: settings.listSpacing + 'px' }}>
            {hasUrl ? (
                <p>
                    <a
                        className="title"
                        style={{ fontSize: settings.titleFontSize + 'px' }}
                        href={item.url}
                        target={settings.openLinkInNewTab ? '_blank' : undefined}
                        rel={settings.openLinkInNewTab ? 'noopener' : undefined}
                    >
                        {item.title}
                    </a>
                    {item.domain && <>{' '}<span className="domain">({item.domain})</span></>}
                </p>
            ) : (
                <p>
                    <Link
                        className="title"
                        style={{ fontSize: settings.titleFontSize + 'px' }}
                        to={`/item/${item.id}`}
                    >
                        {item.title}
                    </Link>
                </p>
            )}
            <div className="subtext-palm">
                {item.type !== 'job' && (
                    <div className="details">
                        <span className="name"><Link to={`/user/${item.user}`}>{item.user}</Link></span>
                        <span className="right">{item.points} ★</span>
                    </div>
                )}
                <div className="details">
                    {item.time_ago}
                    {item.type !== 'job' && (
                        <Link to={`/item/${item.id}`} className="comment-number"> &bull; {formatCommentCount(item.comments_count)}</Link>
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
                <span className={item.type !== 'job' ? 'item-details' : ''}>
                    {item.time_ago}
                    {item.type !== 'job' && (
                        <span> |{' '}
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
