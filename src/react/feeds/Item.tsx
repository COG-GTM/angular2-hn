import { Link } from 'react-router-dom';

import '../../app/feeds/item/item.component.scss';
import { Story } from '../models/story';
import { content } from '../scope';
import { comment } from '../shared/comment';
import { useSettings } from '../settings/SettingsContext';

const c = content('item');

export function Item({ item }: { item: Story }) {
    const { settings } = useSettings();

    const hasUrl = item.url.indexOf('http') === 0;
    const titleStyle = { fontSize: `${settings.titleFontSize}px` };

    return (
        <div style={{ marginBottom: `${settings.listSpacing}px` }} {...c}>
            {hasUrl ? (
                <p {...c}>
                    <a
                        className="title"
                        style={titleStyle}
                        href={item.url}
                        target={settings.openLinkInNewTab ? '_blank' : undefined}
                        rel={settings.openLinkInNewTab ? 'noopener' : undefined}
                        {...c}
                    >
                        {item.title}
                    </a>{' '}
                    {item.domain && (
                        <span className="domain" {...c}>
                            ({item.domain})
                        </span>
                    )}
                </p>
            ) : (
                <p {...c}>
                    <Link className="title" style={titleStyle} to={`/item/${item.id}`} {...c}>
                        {item.title}
                    </Link>
                </p>
            )}
            <div className="subtext-palm" {...c}>
                {item.type !== 'job' && (
                    <div className="details" {...c}>
                        <span className="name" {...c}>
                            <Link to={`/user/${item.user}`} {...c}>
                                {item.user}
                            </Link>
                        </span>
                        <span className="right" {...c}>
                            {item.points} ★
                        </span>
                    </div>
                )}
                <div className="details" {...c}>
                    {item.time_ago}
                    {item.type !== 'job' && (
                        <Link to={`/item/${item.id}`} className="comment-number" {...c}>
                            {' • '}
                            {comment(item.comments_count)}
                        </Link>
                    )}
                </div>
            </div>
            <div className="subtext-laptop" {...c}>
                {item.type !== 'job' && (
                    <span {...c}>
                        {item.points} points by{' '}
                        <Link to={`/user/${item.user}`} {...c}>
                            {item.user}
                        </Link>
                    </span>
                )}
                <span className={item.type !== 'job' ? 'item-details' : undefined} {...c}>
                    {item.time_ago}
                    {item.type !== 'job' && (
                        <span {...c}>
                            {' '}
                            |{' '}
                            <Link to={`/item/${item.id}`} {...c}>
                                {comment(item.comments_count)}
                            </Link>
                        </span>
                    )}
                </span>
            </div>
        </div>
    );
}
