import { NavLink } from 'react-router-dom';

import { Story } from '../../shared/models';
import { formatCommentCount } from '../../shared/helpers/comment-count';
import { useSettings } from '../../shared/services/settings-context';

import './Item.scss';

interface ItemProps {
    item: Story;
}

function activeClassName(baseClassName?: string) {
    return ({ isActive }: { isActive: boolean }) =>
        [baseClassName, isActive ? 'active' : undefined].filter(Boolean).join(' ') || undefined;
}

export default function Item({ item }: ItemProps) {
    const { titleFontSize, listSpacing, openLinkInNewTab } = useSettings();

    const hasUrl = item.url?.indexOf('http') === 0;
    const isJob = item.type === 'job';

    return (
        <div className="feed-item" style={{ marginBottom: `${listSpacing}px` }}>
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
                    <NavLink
                        className={activeClassName('title')}
                        style={{ fontSize: `${titleFontSize}px` }}
                        to={`/item/${item.id}`}
                    >
                        {item.title}
                    </NavLink>
                </p>
            )}
            <div className="subtext-palm">
                {!isJob && (
                    <div className="details">
                        <span className="name">
                            <NavLink className={activeClassName()} to={`/user/${item.user}`}>
                                {item.user}
                            </NavLink>
                        </span>
                        <span className="right">{item.points} ★</span>
                    </div>
                )}
                <div className="details">
                    {item.time_ago}
                    {!isJob && (
                        <NavLink className={activeClassName('comment-number')} to={`/item/${item.id}`}>
                            {' '}
                            • {formatCommentCount(item.comments_count)}
                        </NavLink>
                    )}
                </div>
            </div>
            <div className="subtext-laptop">
                {!isJob && (
                    <span>
                        {item.points} points by{' '}
                        <NavLink className={activeClassName()} to={`/user/${item.user}`}>
                            {item.user}
                        </NavLink>
                    </span>
                )}
                <span className={isJob ? undefined : 'item-details'}>
                    {item.time_ago}
                    {!isJob && (
                        <span>
                            {' '}
                            |{' '}
                            <NavLink className={activeClassName()} to={`/item/${item.id}`}>
                                {formatCommentCount(item.comments_count)}
                            </NavLink>
                        </span>
                    )}
                </span>
            </div>
        </div>
    );
}
