import { Story } from '../../app/shared/models/story';
import { useSettings } from '../context/SettingsContext';
import { formatCommentCount } from '../utils/formatCommentCount';

export interface ItemProps {
    item: Story;
}

// ngOnInit() in ItemComponent has an empty body, so there is no useEffect equivalent to add here.
export const Item = ({ item }: ItemProps) => {
    const settings = useSettings();
    const hasUrl = item.url.indexOf('http') === 0;
    const isJob = item.type === 'job';
    const titleStyle = { fontSize: `${settings.titleFontSize}px` };

    return (
        <div style={{ marginBottom: `${settings.listSpacing}px` }}>
            {hasUrl && (
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
            )}
            {!hasUrl && (
                <p>
                    <a className="title" style={titleStyle} href={`/item/${item.id}`}>
                        {item.title}
                    </a>
                </p>
            )}
            <div className="subtext-palm">
                {!isJob && (
                    <div className="details">
                        <span className="name">
                            <a href={`/user/${item.user}`}>{item.user}</a>
                        </span>
                        <span className="right">{item.points} ★</span>
                    </div>
                )}
                <div className="details">
                    {item.time_ago}
                    {!isJob && (
                        <a href={`/item/${item.id}`} className="comment-number">
                            {' '}
                            • {formatCommentCount(item.comments_count)}
                        </a>
                    )}
                </div>
            </div>
            <div className="subtext-laptop">
                {!isJob && (
                    <span>
                        {item.points} points by <a href={`/user/${item.user}`}>{item.user}</a>
                    </span>
                )}
                <span className={isJob ? undefined : 'item-details'}>
                    {item.time_ago}
                    {!isJob && (
                        <span>
                            {' '}
                            | <a href={`/item/${item.id}`}>{formatCommentCount(item.comments_count)}</a>
                        </span>
                    )}
                </span>
            </div>
        </div>
    );
};
