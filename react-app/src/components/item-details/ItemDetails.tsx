import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { fetchItemContent } from '../../api/hackernews';
import { useSettings } from '../../context/SettingsContext';
import type { Story } from '../../types';
import { commentLabel } from '../../utils/comment';
import { ErrorMessage } from '../shared/ErrorMessage';
import { Loader } from '../shared/Loader';
import { Comment } from './Comment';
import styles from './ItemDetails.module.scss';

export default function ItemDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { settings } = useSettings();

    const [item, setItem] = useState<Story | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const controller = new AbortController();
        setItem(null);
        setErrorMessage('');
        window.scrollTo(0, 0);

        fetchItemContent(Number(id), controller.signal)
            .then(setItem)
            .catch((error: unknown) => {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return;
                }
                setErrorMessage('Could not load item comments.');
            });

        return () => controller.abort();
    }, [id]);

    if (!item) {
        return (
            <div className={styles.mainContent}>
                {errorMessage === '' ? <Loader /> : <ErrorMessage message={errorMessage} />}
            </div>
        );
    }

    const hasUrl = item.url?.indexOf('http') === 0;
    const isJob = item.type === 'job';
    const externalLinkProps = settings.openLinkInNewTab
        ? { target: '_blank', rel: 'noopener noreferrer' }
        : undefined;
    const titleLink = hasUrl ? (
        <a className={styles.title} href={item.url} {...externalLinkProps}>
            {item.title}
        </a>
    ) : (
        <Link className={styles.title} to={`/item/${item.id}`}>
            {item.title}
        </Link>
    );

    return (
        <div className={styles.mainContent}>
            <div className={styles.item}>
                <div className={`item-header ${styles.mobile} ${styles.itemHeader}`}>
                    <p className={styles.titleBlock}>
                        <span
                            className={`back-button ${styles.backButton}`}
                            role="button"
                            tabIndex={0}
                            aria-label="Go back"
                            onClick={() => navigate(-1)}
                        ></span>
                        {titleLink}
                    </p>
                </div>
                <div
                    className={[
                        styles.laptop,
                        item.comments_count > 0 || isJob ? `item-header ${styles.itemHeader}` : '',
                        item.content ? styles.headMargin : '',
                    ]
                        .filter(Boolean)
                        .join(' ')}
                >
                    <p>
                        {titleLink}
                        {hasUrl && item.domain && <span className="domain"> ({item.domain})</span>}
                    </p>
                    <div className={`subtext ${styles.subtext}`}>
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

                {item.type === 'poll' && item.poll && (
                    <div className={styles.pollResults}>
                        {item.poll.map((pollResult, index) => (
                            <div key={index} className="pollContent">
                                <div dangerouslySetInnerHTML={{ __html: pollResult.content }}></div>
                                <div className="subtext">{pollResult.points} points</div>
                                <div
                                    className="pollBar"
                                    style={{
                                        width: `${(pollResult.points / (item.poll_votes_count || 1)) * 100}%`,
                                    }}
                                ></div>
                            </div>
                        ))}
                    </div>
                )}

                {item.content && (
                    <p className={styles.subject} dangerouslySetInnerHTML={{ __html: item.content }}></p>
                )}

                <ul>
                    {item.comments?.map(comment => (
                        <li key={comment.id}>
                            <Comment comment={comment} />
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
