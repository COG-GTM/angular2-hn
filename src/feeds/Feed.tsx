import { useEffect } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';

import { useFeed } from '../shared/api/hooks';
import { ErrorMessage } from '../shared/components/ErrorMessage';
import { Loader } from '../shared/components/Loader';
import { FEED_PAGE_SIZE, type FeedType } from '../shared/models';
import { Item } from './Item';
import './Feed.scss';

interface FeedProps {
    feedType: FeedType;
}

/** Port of the Angular `FeedComponent` (`/news|newest|show|ask|jobs/:page`). */
export function Feed({ feedType }: FeedProps) {
    const { page } = useParams<{ page: string }>();
    const pageNum = page ? Number(page) : 1;
    const isValidPage = Number.isInteger(pageNum) && pageNum > 0;
    const { data: items, error } = useFeed(feedType, isValidPage ? pageNum : 0);
    const listStart = (pageNum - 1) * FEED_PAGE_SIZE + 1;

    useEffect(() => {
        if (items) {
            window.scrollTo(0, 0);
        }
    }, [items]);

    if (!isValidPage) {
        return <Navigate to={`/${feedType}/1`} replace />;
    }

    return (
        <div className="app-feed">
            <div className="main-content">
                {!items && !error && <Loader />}
                {!items && error && <ErrorMessage message={`Could not load ${feedType} stories.`} />}

                {items && (
                    <div>
                        {feedType === 'jobs' && (
                            <p className="job-header">
                                These are jobs at startups that were funded by Y Combinator. You can also get a job at a
                                YC startup through <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
                            </p>
                        )}
                        <ol className={feedType !== 'jobs' ? 'list-margin' : undefined} start={listStart}>
                            {items.map((item) => (
                                <li key={item.id} className="post">
                                    <Item item={item} />
                                </li>
                            ))}
                        </ol>
                        <div className="nav">
                            {listStart !== 1 && (
                                <Link to={`/${feedType}/${pageNum - 1}`} className="prev">
                                    ‹ Prev
                                </Link>
                            )}
                            {items.length === FEED_PAGE_SIZE && (
                                <Link to={`/${feedType}/${pageNum + 1}`} className="more">
                                    More ›
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
