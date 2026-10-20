import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

import { toPositiveInt, useFeed } from '../../shared/api';
import { ErrorMessage, Loader } from '../../shared/components';
import type { FeedType } from '../../shared/models';
import { useScrollToTop } from '../../shared/utils';
import { FeedItem } from './FeedItem';
import './FeedList.scss';

const FEED_PAGE_SIZE = 30;

export interface FeedListProps {
    feedType: FeedType;
}

/** Hand scroll position to the app while mounted, so Back from the bottom of a feed doesn't land under the loader. */
function useManualScrollRestoration(): void {
    useEffect(() => {
        if (!('scrollRestoration' in window.history)) return undefined;
        const previous = window.history.scrollRestoration;
        window.history.scrollRestoration = 'manual';
        return () => {
            window.history.scrollRestoration = previous;
        };
    }, []);
}

/** Port of Angular `FeedComponent`. Route `/:feedType/:page`. */
export function FeedList({ feedType }: FeedListProps) {
    const { page } = useParams<{ page: string }>();
    useManualScrollRestoration();
    useScrollToTop(`${feedType}/${page ?? ''}`);
    const { data: items, isError } = useFeed(feedType, page ?? 1);

    const pageNum = page === undefined ? 1 : toPositiveInt(page);
    const listStart = (pageNum - 1) * FEED_PAGE_SIZE + 1;

    return (
        <div className="main-content feed">
            {/* Phase 1 routes.test.tsx still reads these placeholder test ids; Phase 3 removes them. */}
            <span hidden data-testid="feed-type">
                {feedType}
            </span>
            <span hidden data-testid="feed-page">
                {page}
            </span>
            {!items && !isError && <Loader />}
            {!items && isError && <ErrorMessage message={`Could not load ${feedType} stories.`} />}

            {items && (
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
    );
}
