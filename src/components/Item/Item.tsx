import { Link } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';
import { Story } from '../../types/story';
import { formatCommentCount } from '../../utils/format-comments';
import styles from './Item.module.scss';

interface ItemProps {
    item: Story;
}

export default function Item({ item }: ItemProps) {
    const { settings } = useSettings();

    const hasUrl = item.url && item.url.indexOf('http') === 0;

    return (
        <div style={{ marginBottom: settings.listSpacing + 'px' }}>
            {hasUrl ? (
                <p className={styles.titleP}>
                    <a
                        className={styles.title}
                        style={{ fontSize: settings.titleFontSize + 'px' }}
                        href={item.url}
                        target={settings.openLinkInNewTab ? '_blank' : undefined}
                        rel={settings.openLinkInNewTab ? 'noopener' : undefined}
                    >
                        {item.title}
                    </a>
                    {item.domain && <span className="domain"> ({item.domain})</span>}
                </p>
            ) : (
                <p className={styles.titleP}>
                    <Link
                        className={styles.title}
                        style={{ fontSize: settings.titleFontSize + 'px' }}
                        to={`/item/${item.id}`}
                    >
                        {item.title}
                    </Link>
                </p>
            )}
            <div className="subtext-palm">
                {item.type !== 'job' && (
                    <div className={styles.details}>
                        <span className={styles.detailName}>
                            <Link to={`/user/${item.user}`}>{item.user}</Link>
                        </span>
                        <span className={styles.right}>{item.points} &#9733;</span>
                    </div>
                )}
                <div className={styles.details}>
                    {item.time_ago}
                    {item.type !== 'job' && (
                        <Link to={`/item/${item.id}`} className={styles['comment-number']}>
                            {' '}
                            &bull; {formatCommentCount(item.comments_count)}
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
                            | <Link to={`/item/${item.id}`}>{formatCommentCount(item.comments_count)}</Link>
                        </span>
                    )}
                </span>
            </div>
        </div>
    );
}
