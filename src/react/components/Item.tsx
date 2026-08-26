import { NavLink } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { Story } from '../models/story';
import { formatComments } from '../utils/comments';
import './Item.scss';

interface ItemProps {
    item: Story;
}

function internalLinkClassName({ isActive }: { isActive: boolean }): string {
    return isActive ? 'active' : '';
}

function titleLinkClassName({ isActive }: { isActive: boolean }): string {
    return isActive ? 'title active' : 'title';
}

export default function Item({ item }: ItemProps) {
    const { settings } = useSettings();
    const hasUrl = item.url?.indexOf('http') === 0;
    const titleStyle = { fontSize: `${settings.titleFontSize}px` };

    return (
        <div style={{ marginBottom: `${settings.listSpacing}px` }}>
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
                    </a>
                    {item.domain && <span className="domain">({item.domain})</span>}
                </p>
            ) : (
                <p>
                    <NavLink
                        className={titleLinkClassName}
                        style={titleStyle}
                        to={`/item/${item.id}`}
                    >
                        {item.title}
                    </NavLink>
                </p>
            )}
            <div className="subtext-palm">
                {item.type !== 'job' && (
                    <div className="details">
                        <span className="name">
                            <NavLink to={`/user/${item.user}`} className={internalLinkClassName}>
                                {item.user}
                            </NavLink>
                        </span>
                        <span className="right">{item.points} ★</span>
                    </div>
                )}
                <div className="details">
                    {item.time_ago}
                    {item.type !== 'job' && (
                        <NavLink
                            to={`/item/${item.id}`}
                            className={({ isActive }) => `comment-number${isActive ? ' active' : ''}`}
                        >
                            {' • '}
                            {formatComments(item.comments_count)}
                        </NavLink>
                    )}
                </div>
            </div>
            <div className="subtext-laptop">
                {item.type !== 'job' && (
                    <span>
                        {item.points} points by{' '}
                        <NavLink to={`/user/${item.user}`} className={internalLinkClassName}>
                            {item.user}
                        </NavLink>
                    </span>
                )}
                <span className={item.type !== 'job' ? 'item-details' : undefined}>
                    {item.time_ago}
                    {item.type !== 'job' && (
                        <span>
                            {' | '}
                            <NavLink to={`/item/${item.id}`} className={internalLinkClassName}>
                                {formatComments(item.comments_count)}
                            </NavLink>
                        </span>
                    )}
                </span>
            </div>
        </div>
    );
}
