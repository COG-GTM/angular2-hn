import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchItemContent } from '../../hooks/useHackerNewsApi';
import { useSettings } from '../../contexts/SettingsContext';
import { formatComment } from '../../utils/formatComment';
import { Story } from '../../types/story';
import { Loader } from '../../components/Loader';
import { ErrorMessage } from '../../components/ErrorMessage';
import { Comment } from './Comment';
import styles from './ItemDetailsPage.module.scss';

export function ItemDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const settings = useSettings();

    const [item, setItem] = useState<Story | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (!id) return;
        setItem(null);
        setErrorMessage('');
        fetchItemContent(Number(id))
            .then(setItem)
            .catch(() => setErrorMessage('Could not load item comments.'));
        window.scrollTo(0, 0);
    }, [id]);

    const goBack = () => navigate(-1);
    const hasUrl = item?.url?.indexOf('http') === 0;

    return (
        <div className={styles['main-content']}>
            {!item && !errorMessage && <Loader />}
            {!item && errorMessage !== '' && <ErrorMessage message={errorMessage} />}

            {item && (
                <div className={styles.item}>
                    {/* Mobile header */}
                    <div className={`${styles.mobile} item-header ${styles['item-header']}`}>
                        <p className={styles['title-block']}>
                            <span className={`back-button ${styles['back-button']}`} onClick={goBack}></span>
                            {hasUrl ? (
                                <a
                                    className={styles.title}
                                    href={item.url}
                                    target={settings.openLinkInNewTab ? '_blank' : undefined}
                                    rel={settings.openLinkInNewTab ? 'noopener' : undefined}
                                >
                                    {item.title}
                                </a>
                            ) : (
                                <Link className={styles.title} to={`/item/${item.id}`}>
                                    {item.title}
                                </Link>
                            )}
                        </p>
                    </div>

                    {/* Desktop header */}
                    <div
                        className={`${styles.laptop} ${
                            item.comments_count > 0 || item.type === 'job'
                                ? `item-header ${styles['item-header']}`
                                : ''
                        } ${item.content ? styles['head-margin'] : ''}`}
                    >
                        {hasUrl ? (
                            <p>
                                <a
                                    className={styles.title}
                                    href={item.url}
                                    target={settings.openLinkInNewTab ? '_blank' : undefined}
                                    rel={settings.openLinkInNewTab ? 'noopener' : undefined}
                                >
                                    {item.title}
                                </a>
                                {item.domain && (
                                    <span className={`domain ${styles.domain}`}>({item.domain})</span>
                                )}
                            </p>
                        ) : (
                            <p>
                                <Link className={styles.title} to={`/item/${item.id}`}>
                                    {item.title}
                                </Link>
                            </p>
                        )}
                        <div className={`subtext ${styles.subtext}`}>
                            {item.type !== 'job' && (
                                <span>
                                    {item.points} points by{' '}
                                    <Link to={`/user/${item.user}`}>{item.user}</Link>
                                </span>
                            )}
                            <span className={item.type !== 'job' ? styles['item-details'] : undefined}>
                                {item.time_ago}
                                {item.type !== 'job' && (
                                    <span>
                                        {' '}|{' '}
                                        <Link to={`/item/${item.id}`}>
                                            {formatComment(item.comments_count)}
                                        </Link>
                                    </span>
                                )}
                            </span>
                        </div>
                    </div>

                    {/* Poll results */}
                    {item.type === 'poll' && (
                        <div className={styles.pollResults}>
                            {item.poll?.map((pollResult, i) => (
                                <div key={i} className={`pollContent ${styles.pollContent}`}>
                                    <div dangerouslySetInnerHTML={{ __html: pollResult.content }} />
                                    <div className={`subtext ${styles.subtext}`}>
                                        {pollResult.points} points
                                    </div>
                                    <div
                                        className="pollBar"
                                        style={{
                                            width: `${(pollResult.points / item.poll_votes_count) * 100}%`,
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Content */}
                    {item.content && (
                        <p
                            className={styles.subject}
                            dangerouslySetInnerHTML={{ __html: item.content }}
                        />
                    )}

                    {/* Comments */}
                    <ul className={styles['comment-list']}>
                        {item.comments?.map((comment) => (
                            <li key={comment.id}>
                                <Comment comment={comment} />
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
