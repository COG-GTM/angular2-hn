import { Link } from 'react-router-dom';
import { Story } from '../../types/story';
import { useSettings } from '../../context/SettingsContext';
import { formatCommentCount } from '../../utils/formatCommentCount';
import './Item.scss';

interface ItemProps {
    item: Story;
}

export function Item({ item }: ItemProps) {
    const { settings } = useSettings();
    const hasUrl = item.url.indexOf('http') === 0;

    const target = settings.openLinkInNewTab ? '_blank' : undefined;
    const rel = settings.openLinkInNewTab ? 'noopener' : undefined;
    const titleStyle = { fontSize: `${settings.titleFontSize}px` };
    const isJob = item.type === 'job';

    return (
        <div className="item-block">
            <div style={{ marginBottom: `${settings.listSpacing}px` }}>
                {hasUrl ? (
                    <p>
                        <a className="title" style={titleStyle} href={item.url} target={target} rel={rel}>
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
                    <span className={!isJob ? 'item-details' : undefined}>
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
        </div>
    );
}

export default Item;
