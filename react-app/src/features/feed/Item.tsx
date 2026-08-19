import { NavLink } from 'react-router-dom';

import { useSettings } from '../../context/settings-context';
import type { Story } from '../../models';
import { commentLabel } from '../../shared/comment-label';

export default function Item({ item }: { item: Story }) {
    const { settings } = useSettings();
    const hasUrl = item.url?.indexOf('http') === 0;
    const externalLinkProps = settings.openLinkInNewTab ? { target: '_blank', rel: 'noopener' } : {};

    return (
        <item className="item-block">
            <div style={{ marginBottom: `${settings.listSpacing}px` }}>
                {hasUrl ? (
                    <p>
                        <a
                            className="title"
                            style={{ fontSize: `${settings.titleFontSize}px` }}
                            href={item.url}
                            {...externalLinkProps}
                        >
                            {` ${item.title} `}
                        </a>
                        {item.domain && <span className="domain">({item.domain})</span>}
                    </p>
                ) : (
                    <p>
                        <NavLink
                            className="title"
                            style={{ fontSize: `${settings.titleFontSize}px` }}
                            to={`/item/${item.id}`}
                        >
                            {` ${item.title} `}
                        </NavLink>
                    </p>
                )}
                <div className="subtext-palm">
                    {item.type !== 'job' && (
                        <div className="details">
                            <span className="name">
                                <NavLink to={`/user/${item.user}`}>{item.user}</NavLink>
                            </span>
                            <span className="right">{item.points} ★</span>
                        </div>
                    )}
                    <div className="details">
                        {` ${item.time_ago} `}
                        {item.type !== 'job' && (
                            <NavLink to={`/item/${item.id}`} className="comment-number">
                                {` • ${commentLabel(item.comments_count)} `}
                            </NavLink>
                        )}
                    </div>
                </div>
                <div className="subtext-laptop">
                    {item.type !== 'job' && (
                        <span>
                            {` ${item.points} points by `}
                            <NavLink to={`/user/${item.user}`}>{item.user}</NavLink>
                        </span>
                    )}
                    <span className={item.type !== 'job' ? 'item-details' : undefined}>
                        {` ${item.time_ago} `}
                        {item.type !== 'job' && (
                            <span>
                                {' | '}
                                <NavLink to={`/item/${item.id}`}>{` ${commentLabel(item.comments_count)} `}</NavLink>
                            </span>
                        )}
                    </span>
                </div>
            </div>
        </item>
    );
}
