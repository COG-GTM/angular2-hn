import { NavLink } from 'react-router-dom';

import { Story } from '../../shared/models';
import { useSettings } from '../../shared/settings/useSettings';
import { formatCommentCount } from '../../shared/utils/comment';
import './Item.scss';

interface ItemProps {
    item: Story;
    className?: string;
}

function withActive(baseClass?: string) {
    return ({ isActive }: { isActive: boolean }) => [baseClass, isActive ? 'active' : ''].filter(Boolean).join(' ');
}

export function Item({ item, className }: ItemProps) {
    const { settings } = useSettings();
    const hasUrl = item.url.indexOf('http') === 0;
    const titleStyle = { fontSize: settings.titleFontSize + 'px' };
    const isJob = item.type === 'job';

    return (
        <div className={className} style={{ marginBottom: settings.listSpacing + 'px' }}>
            {hasUrl ? (
                <p>
                    <a
                        className="title"
                        style={titleStyle}
                        href={item.url}
                        target={settings.openLinkInNewTab ? '_blank' : undefined}
                        rel={settings.openLinkInNewTab ? 'noopener' : undefined}
                    >
                        {item.title}
                    </a>{' '}
                    {item.domain ? <span className="domain">({item.domain})</span> : null}
                </p>
            ) : (
                <p>
                    <NavLink className={withActive('title')} style={titleStyle} to={'/item/' + item.id}>
                        {item.title}
                    </NavLink>
                </p>
            )}
            <div className="subtext-palm">
                {!isJob && (
                    <div className="details">
                        <span className="name">
                            <NavLink className={withActive()} to={'/user/' + item.user}>
                                {item.user}
                            </NavLink>
                        </span>
                        <span className="right">{item.points} ★</span>
                    </div>
                )}
                <div className="details">
                    {item.time_ago}{' '}
                    {!isJob && (
                        <NavLink className={withActive('comment-number')} to={'/item/' + item.id}>
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
                        <NavLink className={withActive()} to={'/user/' + item.user}>
                            {item.user}
                        </NavLink>
                    </span>
                )}{' '}
                <span className={!isJob ? 'item-details' : undefined}>
                    {item.time_ago}{' '}
                    {!isJob && (
                        <span>
                            |{' '}
                            <NavLink className={withActive()} to={'/item/' + item.id}>
                                {formatCommentCount(item.comments_count)}
                            </NavLink>
                        </span>
                    )}
                </span>
            </div>
        </div>
    );
}
