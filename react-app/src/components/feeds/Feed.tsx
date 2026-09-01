import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

import ErrorMessage from '../shared/ErrorMessage';
import Loader from '../shared/Loader';
import Item from './Item';
import { useFeed } from '../../hooks/useHackerNews';
import type { FeedType } from '../../models/feed-type.type';
import styles from './Feed.module.scss';

export interface FeedProps {
    feedType: FeedType;
}

export default function Feed({ feedType }: FeedProps) {
    const { page } = useParams<{ page?: string }>();
    const pageNum = Number(page) || 1;
    const listStart = (pageNum - 1) * 30 + 1;

    const { data: items, isPending, isError } = useFeed(feedType, pageNum);

    useEffect(() => {
        if (items) {
            window.scrollTo(0, 0);
        }
    }, [items]);

    return (
        <div className={styles['main-content']}>
            {isPending && <Loader />}
            {isError && <ErrorMessage message={`Could not load ${feedType} stories.`} />}

            {items && (
                <div>
                    {feedType === 'jobs' && (
                        <p className="job-header">
                            These are jobs at startups that were funded by Y Combinator. You can also get a job at a YC
                            startup through <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
                        </p>
                    )}
                    <ol className={feedType !== 'jobs' ? styles['list-margin'] : undefined} start={listStart}>
                        {items.map((item) => (
                            <li key={item.id} className={styles.post}>
                                <div className={styles['item-block']}>
                                    <Item item={item} />
                                </div>
                            </li>
                        ))}
                    </ol>
                    <div className="nav">
                        {listStart !== 1 && (
                            <Link to={`/${feedType}/${pageNum - 1}`} className={styles.prev}>
                                ‹ Prev
                            </Link>
                        )}
                        {items.length === 30 && (
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
