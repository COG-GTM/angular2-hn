import { Link } from 'react-router-dom';

import { useSettings } from '../../context/SettingsContext';
import type { Story } from '../../types';
import { commentLabel } from '../../utils/comment';
import styles from './Item.module.scss';

export function Item({ item }: { item: Story }) {
    const { settings } = useSettings();

    const hasUrl = item.url?.indexOf('http') === 0;
    const isJob = item.type === 'job';
    const titleStyle = { fontSize: `${settings.titleFontSize}px` };
    const externalLinkProps = settings.openLinkInNewTab
        ? { target: '_blank', rel: 'noopener noreferrer' }
        : undefined;

    return (
        <div className={styles.item} style={{ marginBottom: `${settings.listSpacing}px` }}>
            {hasUrl ? (
                <p>
                    <a className={styles.title} style={titleStyle} href={item.url} {...externalLinkProps}>
                        {item.title}
                    </a>
                    {item.domain && <span className="domain"> ({item.domain})</span>}
                </p>
            ) : (
                <p>
                    <Link className={styles.title} style={titleStyle} to={`/item/${item.id}`}>
                        {item.title}
                    </Link>
                </p>
            )}
            <div className="subtext-palm">
                {!isJob && (
                    <div className={styles.details}>
                        <span className={styles.name}>
                            <Link to={`/user/${item.user}`}>{item.user}</Link>
                        </span>
                        <span className={styles.right}>{item.points} ★</span>
                    </div>
                )}
                <div className={styles.details}>
                    {item.time_ago}
                    {!isJob && (
                        <Link to={`/item/${item.id}`}> • {commentLabel(item.comments_count)}</Link>
                    )}
                </div>
            </div>
            <div className="subtext-laptop">
                {!isJob && (
                    <span>
                        {item.points} points by <Link to={`/user/${item.user}`}>{item.user}</Link>
                    </span>
                )}
                <span className={isJob ? undefined : styles.itemDetails}>
                    {item.time_ago}
                    {!isJob && (
                        <span>
                            {' | '}
                            <Link to={`/item/${item.id}`}>{commentLabel(item.comments_count)}</Link>
                        </span>
                    )}
                </span>
            </div>
        </div>
    );
}
