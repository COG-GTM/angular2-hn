import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useFeed } from '../../hooks/useFeed';
import type { FeedName } from '../../models';
import { ErrorMessage, Loader } from '../shared';
import { Item } from './Item';
import './Feed.scss';

export interface FeedProps {
    feedType: FeedName;
    page: number;
}

const PAGE_SIZE = 30;

export function Feed({ feedType, page }: FeedProps) {
    const { data: items, isPending, isError } = useFeed(feedType, page);

    useEffect(() => {
        if (items) {
            window.scrollTo(0, 0);
        }
    }, [items]);

    return (
        <div className="main-content feed">
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
                    <ol className={feedType !== 'jobs' ? 'list-margin' : undefined} start={(page - 1) * PAGE_SIZE + 1}>
                        {items.map((item) => (
                            <li key={item.id} className="post">
                                <Item item={item} />
                            </li>
                        ))}
                    </ol>
                    <div className="nav">
                        {page > 1 && (
                            <Link to={`/${feedType}/${page - 1}`} className="prev">
                                ‹ Prev
                            </Link>
                        )}
                        {items.length === PAGE_SIZE && (
                            <Link to={`/${feedType}/${page + 1}`} className="more">
                                More ›
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
