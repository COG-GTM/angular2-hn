import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { fetchFeed } from '../../api/hackernews';
import type { Story } from '../../types';
import { ErrorMessage } from '../shared/ErrorMessage';
import { Loader } from '../shared/Loader';
import { Item } from './Item';
import styles from './Feed.module.scss';

const PAGE_SIZE = 30;

export function Feed({ feedType }: { feedType: string }) {
    const { page } = useParams<{ page: string }>();
    const pageNum = page ? Number(page) : 1;

    const [items, setItems] = useState<Story[] | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const controller = new AbortController();
        setItems(null);
        setErrorMessage('');

        fetchFeed(feedType, pageNum, controller.signal)
            .then(stories => {
                setItems(stories);
                window.scrollTo(0, 0);
            })
            .catch((error: unknown) => {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return;
                }
                setErrorMessage(`Could not load ${feedType} stories.`);
            });

        return () => controller.abort();
    }, [feedType, pageNum]);

    const listStart = (pageNum - 1) * PAGE_SIZE + 1;

    return (
        <div className={styles.mainContent}>
            {!items && !errorMessage && <Loader />}
            {!items && errorMessage !== '' && <ErrorMessage message={errorMessage} />}

            {items && (
                <div>
                    {feedType === 'jobs' && (
                        <p className={`job-header ${styles.jobHeader}`}>
                            These are jobs at startups that were funded by Y Combinator. You can also get a job at a
                            YC startup through <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
                        </p>
                    )}
                    <ol className={feedType !== 'jobs' ? styles.listMargin : undefined} start={listStart}>
                        {items.map(item => (
                            <li key={item.id} className={styles.post}>
                                <div className={styles.itemBlock}>
                                    <Item item={item} />
                                </div>
                            </li>
                        ))}
                    </ol>
                    <div className={`nav ${styles.nav}`}>
                        {listStart !== 1 && (
                            <Link to={`/${feedType}/${pageNum - 1}`} className={styles.prev}>
                                ‹ Prev
                            </Link>
                        )}
                        {items.length === PAGE_SIZE && (
                            <Link to={`/${feedType}/${pageNum + 1}`} className={styles.more}>
                                More ›
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
