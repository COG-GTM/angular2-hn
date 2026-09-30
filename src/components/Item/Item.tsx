import { useSettings } from '../../context/SettingsContext';
import type { Story } from '../../models';
import { formatCommentCount } from '../../utils/formatCommentCount';
import { hasExternalUrl } from '../../utils/hasExternalUrl';
import { RouterLink } from '../RouterLink';
import './Item.scss';

export function Item({ item }: { item: Story }) {
    const { settings } = useSettings();
    const titleStyle = { fontSize: settings.titleFontSize + 'px' };
    const isJob = item.type === 'job';

    return (
        <item className="item-block">
            <div style={{ marginBottom: settings.listSpacing + 'px' }}>
                {hasExternalUrl(item) ? (
                    <p>
                        <a
                            className="title"
                            style={titleStyle}
                            href={item.url}
                            target={settings.openLinkInNewTab ? '_blank' : undefined}
                            rel={settings.openLinkInNewTab ? 'noopener' : undefined}
                        >
                            {` ${item.title} `}
                        </a>
                        {item.domain && <span className="domain">{`(${item.domain})`}</span>}
                    </p>
                ) : (
                    <p>
                        <RouterLink className="title" style={titleStyle} to={`/item/${item.id}`}>
                            {` ${item.title} `}
                        </RouterLink>
                    </p>
                )}
                <div className="subtext-palm">
                    {!isJob && (
                        <div className="details">
                            <span className="name">
                                <RouterLink to={`/user/${item.user}`}>{item.user}</RouterLink>
                            </span>
                            <span className="right">{`${item.points} ★`}</span>
                        </div>
                    )}
                    <div className="details">
                        {` ${item.time_ago} `}
                        {!isJob && (
                            <RouterLink to={`/item/${item.id}`} className="comment-number">
                                {` • ${formatCommentCount(item.comments_count)} `}
                            </RouterLink>
                        )}
                    </div>
                </div>
                <div className="subtext-laptop">
                    {!isJob && (
                        <span>
                            {` ${item.points} points by `}
                            <RouterLink to={`/user/${item.user}`}>{item.user}</RouterLink>
                        </span>
                    )}
                    <span className={!isJob ? 'item-details' : undefined}>
                        {` ${item.time_ago} `}
                        {!isJob && (
                            <span>
                                {' | '}
                                <RouterLink to={`/item/${item.id}`}>{` ${formatCommentCount(item.comments_count)} `}</RouterLink>
                            </span>
                        )}
                    </span>
                </div>
            </div>
        </item>
    );
}
