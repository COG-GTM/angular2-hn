import { Link } from 'react-router-dom';
import { useSettings } from '../../context';
import type { Story } from '../../models';
import { formatCommentCount, hasExternalUrl, linkTargetProps } from '../../utils';
import './Item.scss';

export interface ItemProps {
    item: Story;
}

export function Item({ item }: ItemProps) {
    const { settings } = useSettings();
    const isJob = item.type === 'job';
    const titleStyle = { fontSize: `${settings.titleFontSize}px` };
    const commentCount = formatCommentCount(item.comments_count);

    return (
        <div className="item-block" style={{ marginBottom: `${settings.listSpacing}px` }}>
            {hasExternalUrl(item.url) ? (
                <p>
                    <a
                        className="title"
                        style={titleStyle}
                        href={item.url}
                        {...linkTargetProps(settings.openLinkInNewTab)}
                    >
                        {item.title}
                    </a>{' '}
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
                            • {commentCount}
                        </Link>
                    )}
                </div>
            </div>
            <div className="subtext-laptop">
                {!isJob && (
                    <span>
                        {item.points} points by <Link to={`/user/${item.user}`}>{item.user}</Link>{' '}
                    </span>
                )}
                <span className={isJob ? undefined : 'item-details'}>
                    {item.time_ago}
                    {!isJob && (
                        <span>
                            {' | '}
                            <Link to={`/item/${item.id}`}>{commentCount}</Link>
                        </span>
                    )}
                </span>
            </div>
        </div>
    );
}
