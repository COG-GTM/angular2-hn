import React, { useState, useEffect, useCallback } from 'react';

/**
 * Story model matching the Angular Story class
 * (src/app/shared/models/story.ts)
 */
export interface Story {
    id: number;
    title: string;
    points: number;
    user: string;
    time: number;
    time_ago: number;
    type: 'poll' | 'story' | 'job';
    url: string;
    domain: string;
    comments_count: number;
    deleted: boolean;
    dead: boolean;
}

export interface FeedComponentProps {
    /** The feed type: 'news' | 'newest' | 'show' | 'ask' | 'jobs' */
    feedType: string;
    /** The current page number (defaults to 1) */
    pageNum?: number;
    /**
     * Callback to navigate to a different page.
     * In Angular, this was handled by [routerLink].
     * TODO: Replace with React Router <Link> or useNavigate() when React Router is integrated.
     */
    onNavigate?: (path: string) => void;
    /**
     * Custom feed fetcher function.
     * Mirrors HackerNewsAPIService.fetchFeed(feedType, page).
     * If not provided, uses the default fetch from the HN API.
     */
    fetchFeed?: (feedType: string, page: number) => Promise<Story[]>;
    /**
     * Render prop for each story item.
     * Mirrors the Angular <item [item]="item"> child component.
     * TODO: Replace with actual ItemComponent when migrated to React.
     */
    renderItem?: (item: Story) => React.ReactNode;
    /**
     * Render prop for the loading state.
     * Mirrors Angular <app-loader>.
     * TODO: Replace with actual Loader component when migrated to React.
     */
    renderLoader?: () => React.ReactNode;
    /**
     * Render prop for the error state.
     * Mirrors Angular <app-error-message [message]="errorMessage">.
     * TODO: Replace with actual ErrorMessage component when migrated to React.
     */
    renderErrorMessage?: (message: string) => React.ReactNode;
}

const BASE_URL = 'https://node-hnapi.herokuapp.com';

/**
 * Default fetch function mirroring HackerNewsAPIService.fetchFeed.
 * Uses the same endpoint and cancellation pattern as the Angular service's lazyFetch.
 */
async function defaultFetchFeed(
    feedType: string,
    page: number,
    signal?: AbortSignal
): Promise<Story[]> {
    const response = await fetch(`${BASE_URL}/${feedType}?page=${page}`, { signal });
    return response.json();
}

/**
 * Custom hook that encapsulates the feed fetching logic.
 * Mirrors the data-fetching responsibilities of HackerNewsAPIService + ngOnInit in Angular.
 *
 * @param feedType - The type of feed to fetch
 * @param pageNum - The page number
 * @param fetchFeedFn - Optional custom fetch function (for dependency injection, mirrors Angular DI)
 */
function useFeed(
    feedType: string,
    pageNum: number,
    fetchFeedFn?: (feedType: string, page: number) => Promise<Story[]>
) {
    const [items, setItems] = useState<Story[] | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [listStart, setListStart] = useState<number>(1);

    useEffect(() => {
        // Reset state on feed/page change (mirrors Angular re-subscription behavior)
        setItems(null);
        setErrorMessage('');

        const abortController = new AbortController();

        const doFetch = async () => {
            try {
                let result: Story[];
                if (fetchFeedFn) {
                    result = await fetchFeedFn(feedType, pageNum);
                } else {
                    result = await defaultFetchFeed(feedType, pageNum, abortController.signal);
                }

                if (!abortController.signal.aborted) {
                    setItems(result);
                    // Mirrors the complete callback: calculate listStart and scroll to top
                    setListStart((pageNum - 1) * 30 + 1);
                    window.scrollTo(0, 0);
                }
            } catch (error: unknown) {
                if (!abortController.signal.aborted) {
                    setErrorMessage('Could not load ' + feedType + ' stories.');
                }
            }
        };

        doFetch();

        // Cleanup mirrors ngOnDestroy / Subscription.unsubscribe()
        return () => {
            abortController.abort();
        };
    }, [feedType, pageNum, fetchFeedFn]);

    return { items, errorMessage, listStart };
}

/**
 * FeedComponent — React port of the Angular FeedComponent.
 *
 * Displays paginated lists of Hacker News stories (news, newest, show, ask, jobs)
 * and handles data loading states.
 *
 * Angular source: src/app/feeds/feed/feed.component.ts
 *
 * Dependency mapping:
 *   - HackerNewsAPIService.fetchFeed → props.fetchFeed / defaultFetchFeed (via useFeed hook)
 *   - ActivatedRoute.data.feedType   → props.feedType
 *   - ActivatedRoute.params.page     → props.pageNum
 *   - [routerLink] navigation        → props.onNavigate callback
 *   - <item [item]="item">           → props.renderItem render prop
 *   - <app-loader>                   → props.renderLoader render prop
 *   - <app-error-message>            → props.renderErrorMessage render prop
 */
export const FeedComponent: React.FC<FeedComponentProps> = ({
    feedType,
    pageNum = 1,
    onNavigate,
    fetchFeed,
    renderItem,
    renderLoader,
    renderErrorMessage,
}) => {
    const { items, errorMessage, listStart } = useFeed(feedType, pageNum, fetchFeed);

    /**
     * Helper to handle navigation link clicks.
     * Mirrors Angular [routerLink]="['/' + feedType, pageNum +/- 1]".
     * TODO: Replace with React Router <Link> or useNavigate() when integrated.
     */
    const handleNavigate = useCallback((page: number) => {
        if (onNavigate) {
            onNavigate(`/${feedType}/${page}`);
        }
    }, [onNavigate, feedType]);

    return (
        <div className="main-content">
            {/* *ngIf="!items && !errorMessage" → show loader */}
            {!items && !errorMessage && (renderLoader ? renderLoader() : null)}

            {/* *ngIf="!items && errorMessage !==''" → show error message */}
            {!items && errorMessage !== '' && (
                renderErrorMessage
                    ? renderErrorMessage(errorMessage)
                    : <div>{errorMessage}</div>
            )}

            {/* *ngIf="items" → show feed content */}
            {items && (
                <div>
                    {/* *ngIf="feedType === 'jobs'" → job header */}
                    {feedType === 'jobs' && (
                        <p className="job-header">
                            These are jobs at startups that were funded by Y Combinator.
                            You can also get a job at a YC startup through{' '}
                            <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
                        </p>
                    )}

                    {/* *ngIf="feedType !== 'new'" → ordered list with items */}
                    {feedType !== 'new' && (
                        <ol
                            className={feedType !== 'jobs' ? 'list-margin' : undefined}
                            start={listStart}
                        >
                            {/* *ngFor="let item of items" */}
                            {items.map((item) => (
                                <li key={item.id} className="post">
                                    {/* <item class="item-block" [item]="item"> */}
                                    {renderItem ? (
                                        <span className="item-block">{renderItem(item)}</span>
                                    ) : (
                                        <span className="item-block">{item.title}</span>
                                    )}
                                </li>
                            ))}
                        </ol>
                    )}

                    {/* Navigation: Prev / More links */}
                    <div className="nav">
                        {/* *ngIf="listStart !== 1" → Prev link */}
                        {listStart !== 1 && (
                            <a
                                className="prev"
                                href={`/${feedType}/${pageNum - 1}`}
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleNavigate(pageNum - 1);
                                }}
                            >
                                ‹ Prev
                            </a>
                        )}

                        {/* *ngIf="items.length === 30" → More link */}
                        {items.length === 30 && (
                            <a
                                className="more"
                                href={`/${feedType}/${pageNum + 1}`}
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleNavigate(pageNum + 1);
                                }}
                            >
                                More ›
                            </a>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
