import { useEffect } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';

import { fetchFeed } from '../../services';
import { ErrorMessage, Loader } from '../../components';
import { useFetch } from '../../hooks/useFetch';
import type { FeedType } from '../../types';
import { useScrollToTop } from '../../utils';
import { Item } from './Item';
import './FeedPage.scss';

export interface FeedPageProps {
    feedType: FeedType;
}

/** node-hnapi pages hold 30 stories; a shorter page is the last one. */
const PAGE_SIZE = 30;

/**
 * Every navigation shows the loader (Angular kept the old list on screen), so Chrome's native scroll restoration,
 * which runs after our scroll-to-top on Back, would leave a blank viewport. Keep it manual while a feed is mounted.
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

/** Port of src/app/feeds/feed: the `/{feedType}/:page` story list with ‹ Prev / More › pagination. */
export function FeedPage({ feedType }: FeedPageProps) {
    const { page = '1' } = useParams();
    const location = useLocation();
    const key = `${feedType}/${page}/${location.key}`;
    useScrollToTop(key);
    useManualScrollRestoration();
    const state = useFetch(
        (signal) => fetchFeed(feedType, page, signal).then((items) => ({ items, pageNum: Number(page) })),
        key
    );
    // Angular keeps the previous page's list on screen until the next page arrives, and keeps it (with no error
    // message) if that request fails.
    const shown = state.status === 'success' ? state.data : state.stale;

    // Angular: `window.scrollTo(0, 0)` once the feed request completes.
    useEffect(() => {
        if (state.status === 'success') window.scrollTo(0, 0);
    }, [state.status, key]);

    if (state.status === 'loading' && !shown) {
        return (
            <div className="main-content feed">
                <Loader />
            </div>
        );
    }
    if (state.status === 'error' && !shown) {
        return (
            <div className="main-content feed">
                <ErrorMessage message={`Could not load ${feedType} stories.`} />
            </div>
        );
    }

    // Numbering and Prev/More follow the list on screen, so a failed page can be retried with More.
    const { items, pageNum } = shown!;
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
                            <Item item={item} />
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
