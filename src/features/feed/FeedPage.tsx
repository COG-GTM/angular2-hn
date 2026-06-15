import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchFeed } from '../../hooks/useHackerNewsApi';
import { Story } from '../../types/story';
import { Loader } from '../../components/Loader';
import { ErrorMessage } from '../../components/ErrorMessage';
import { FeedItem } from './FeedItem';
import styles from './FeedPage.module.scss';

export function FeedPage() {
    const { feedType = 'news', page = '1' } = useParams<{ feedType: string; page: string }>();
    const pageNum = Number(page) || 1;
    const listStart = (pageNum - 1) * 30 + 1;

    const [items, setItems] = useState<Story[] | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        setItems(null);
        setErrorMessage('');
        fetchFeed(feedType, pageNum)
            .then((data) => {
                setItems(data);
                window.scrollTo(0, 0);
            })
            .catch(() => {
                setErrorMessage(`Could not load ${feedType} stories.`);
            });
    }, [feedType, pageNum]);

    return (
        <div className={styles['main-content']}>
            {!items && !errorMessage && <Loader />}
            {!items && errorMessage !== '' && <ErrorMessage message={errorMessage} />}

            {items && (
                <div>
                    {feedType === 'jobs' && (
                        <p className={`job-header ${styles['job-header']}`}>
                            These are jobs at startups that were funded by Y Combinator.
                            You can also get a job at a YC startup through{' '}
                            <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
                        </p>
                    )}
                    {feedType !== 'new' && (
                        <ol
                            className={feedType !== 'jobs' ? styles['list-margin'] : undefined}
                            start={listStart}
                        >
                            {items.map((item) => (
                                <li key={item.id} className={styles.post}>
                                    <div className={styles['item-block']}>
                                        <FeedItem item={item} />
                                    </div>
                                </li>
                            ))}
                        </ol>
                    )}
                    <div className={`nav ${styles.nav}`}>
                        {listStart !== 1 && (
                            <Link
                                to={`/${feedType}/${pageNum - 1}`}
                                className={styles.prev}
                            >
                                ‹ Prev
                            </Link>
                        )}
                        {items.length === 30 && (
                            <Link
                                to={`/${feedType}/${pageNum + 1}`}
                                className={styles.more}
                            >
                                More ›
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
