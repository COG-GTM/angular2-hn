import { useEffect } from 'react';
import { Link, useParams } from 'react-router';

import { toPositiveInt, useFeed } from '../../shared/api';
import { ErrorMessage, Loader } from '../../shared/components';
import type { FeedType } from '../../shared/models';
import { useScrollToTop } from '../../shared/utils';
import { FeedItem } from './FeedItem';
import './FeedList.scss';

export interface FeedListProps {
    feedType: FeedType;
}

const PAGE_SIZE = 30;

/**
 * Pages show the loader on every navigation, so the browser's own scroll restoration (which runs after our
 * scroll-to-top on Back) would leave a blank viewport below the loader. Keep it manual while a feed is mounted.
 */
function useManualScrollRestoration(): void {
    useEffect(() => {
        const { history } = window;
        const previous = history.scrollRestoration;
        history.scrollRestoration = 'manual';
        return () => {
            history.scrollRestoration = previous;
        };
    }, []);
}

/** Port of Angular `feeds/feed`: `/{feedType}/:page` story list with ‹ Prev / More › pagination. */
export function FeedList({ feedType }: FeedListProps) {
    const { page } = useParams<{ page: string }>();
    useScrollToTop(`${feedType}/${page}`);
    useManualScrollRestoration();
    const { data: items, isPending, isError } = useFeed(feedType, page);

    if (isPending) {
        return (
            <div className="main-content feed">
                <Loader />
            </div>
        );
    }
    if (isError) {
        return (
            <div className="main-content feed">
                <ErrorMessage message={`Could not load ${feedType} stories.`} />
            </div>
        );
    }

    const pageNum = toPositiveInt(page);
    const listStart = (pageNum - 1) * PAGE_SIZE + 1;

    return (
        <div className="main-content feed">
            <div>
                {feedType === 'jobs' && (
                    <p className="job-header">
                        These are jobs at startups that were funded by Y Combinator. You can also get a job at a YC
                        startup through <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
                    </p>
                )}
                <ol className={feedType !== 'jobs' ? 'list-margin' : undefined} start={listStart}>
                    {items.map((item) => (
                        <li key={item.id} className="post">
                            <FeedItem item={item} />
                        </li>
                    ))}
                </ol>
                <div className="nav">
                    {listStart !== 1 && (
                        <Link to={`/${feedType}/${pageNum - 1}`} className="prev">
                            ‹ Prev{' '}
                        </Link>
                    )}
                    {items.length === PAGE_SIZE && (
                        <Link to={`/${feedType}/${pageNum + 1}`} className="more">
                            More ›
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
