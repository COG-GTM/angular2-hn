import { Link } from 'react-router-dom';

import { useSettings } from '../../context/SettingsContext';
import type { Story } from '../../models/story';
import { commentLabel } from '../../utils/comment';
import { hasExternalUrl } from '../../utils/url';
import styles from './Item.module.scss';

export interface ItemProps {
    item: Story;
}

export default function Item({ item }: ItemProps) {
    const { settings } = useSettings();
    const titleStyle = { fontSize: `${settings.titleFontSize}px` };
    const newTabProps = settings.openLinkInNewTab ? { target: '_blank', rel: 'noopener' } : {};

    return (
        <div className={styles.item} style={{ marginBottom: `${settings.listSpacing}px` }}>
            {hasExternalUrl(item.url) ? (
                <p className={styles.paragraph}>
                    <a className={styles.title} style={titleStyle} href={item.url} {...newTabProps}>
                        {item.title}
                    </a>
                    {item.domain && <span className="domain">({item.domain})</span>}
                </p>
            ) : (
                <p className={styles.paragraph}>
                    <Link className={styles.title} style={titleStyle} to={`/item/${item.id}`}>
                        {item.title}
                    </Link>
                </p>
            )}
            <div className="subtext-palm">
                {item.type !== 'job' && (
                    <div className={styles.details}>
                        <span className="name">
                            <Link to={`/user/${item.user}`}>{item.user}</Link>
                        </span>
                        <span className="right">{item.points} ★</span>
                    </div>
                )}
                <div className={styles.details}>
                    {item.time_ago}
                    {item.type !== 'job' && (
                        <Link to={`/item/${item.id}`} className={styles['comment-number']}>
                            {' '}
                            • {commentLabel(item.comments_count)}
                        </Link>
                    )}
                </div>
            </div>
            <div className="subtext-laptop">
                {item.type !== 'job' && (
                    <span>
                        {item.points} points by <Link to={`/user/${item.user}`}>{item.user}</Link>
                    </span>
                )}
                <span className={item.type !== 'job' ? styles['item-details'] : undefined}>
                    {item.time_ago}
                    {item.type !== 'job' && (
                        <span>
                            {' '}
                            | <Link to={`/item/${item.id}`}>{commentLabel(item.comments_count)}</Link>
                        </span>
                    )}
                </span>
            </div>
        </div>
    );
}
