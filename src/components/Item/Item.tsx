import { Link } from 'react-router-dom'
import { useSettings } from '../../context/SettingsContext'
import { formatComment } from '../../utils/formatComment'
import type { Story } from '../../types'
import styles from './Item.module.scss'

interface ItemProps {
    item: Story
}

export function Item({ item }: ItemProps) {
    const { settings } = useSettings()
    const hasUrl = item.url && item.url.indexOf('http') === 0

    return (
        <div style={{ marginBottom: `${settings.listSpacing}px` }}>
            <p>
                {hasUrl ? (
                    <a
                        className={styles.title}
                        style={{ fontSize: `${settings.titleFontSize}px` }}
                        href={item.url}
                        target={settings.openLinkInNewTab ? '_blank' : undefined}
                        rel={settings.openLinkInNewTab ? 'noopener' : undefined}
                    >
                        {item.title}
                    </a>
                ) : (
                    <Link
                        className={styles.title}
                        style={{ fontSize: `${settings.titleFontSize}px` }}
                        to={`/item/${item.id}`}
                    >
                        {item.title}
                    </Link>
                )}
                {hasUrl && item.domain && <span className={styles.domain}> ({item.domain})</span>}
            </p>
            <div className={styles['subtext-palm']}>
                {item.type !== 'job' && (
                    <div className={styles.details}>
                        <span className={styles.name}>
                            <Link to={`/user/${item.user}`}>{item.user}</Link>
                        </span>
                        <span className={styles.right}>{item.points} ★</span>
                    </div>
                )}
                <div className={styles.details}>
                    {item.time_ago}
                    {item.type !== 'job' && (
                        <Link to={`/item/${item.id}`} className={styles['comment-number']}>
                            {' '}
                            • {formatComment(item.comments_count)}
                        </Link>
                    )}
                </div>
            </div>
            <div className={styles['subtext-laptop']}>
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
                            | <Link to={`/item/${item.id}`}>{formatComment(item.comments_count)}</Link>
                        </span>
                    )}
                </span>
            </div>
        </div>
    )
}
