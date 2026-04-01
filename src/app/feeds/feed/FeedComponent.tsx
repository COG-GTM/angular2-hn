import React, { useState, useEffect } from 'react';

/**
 * Story model matching the Angular Story class
 * (src/app/shared/models/story.ts)
 */
interface Story {
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

interface FeedComponentProps {
    /** The feed type: 'news' | 'newest' | 'show' | 'ask' | 'jobs' */
    feedType: string;
    /** The current page number (defaults to 1) */
    pageNum?: number;
    /**
     * Callback to navigate to a different page.
     * In Angular, this was handled by [routerLink].
     * TODO: Replace with React Router navigation when integrated.
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
     * TODO: Replace with actual Item component when available.
     */
    renderItem?: (item: Story) => React.ReactNode;
    /**
     * Render prop for the loading state.
     * Mirrors Angular <app-loader>.
     */
    renderLoader?: () => React.ReactNode;
    /**
     * Render prop for the error state.
     * Mirrors Angular <app-error-message [message]="errorMessage">.
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
 * FeedComponent — React port of the Angular FeedComponent.
 *
 * Displays paginated lists of Hacker News stories (news, newest, show, ask, jobs)
 * and handles data loading states.
 *
 * Angular source: src/app/feeds/feed/feed.component.ts
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
    const [items, setItems] = useState<Story[] | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [listStart, setListStart] = useState<number>(1);

    /**
     * Mirrors ngOnInit subscription to route.params:
     * - Fetches feed data when feedType or pageNum changes
     * - Handles success/error/complete callbacks
     * - Cleans up via AbortController (replaces RxJS Subscription cancellation)
     */
    useEffect(() => {
        // Reset state on feed/page change (mirrors Angular re-subscription behavior)
        setItems(null);
        setErrorMessage('');

        const abortController = new AbortController();

        const doFetch = async () => {
            try {
                let result: Story[];
                if (fetchFeed) {
                    result = await fetchFeed(feedType, pageNum);
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
    }, [feedType, pageNum, fetchFeed]);

    /**
     * Helper to handle navigation link clicks.
     * Mirrors Angular [routerLink]="['/' + feedType, pageNum +/- 1]".
     */
    const handleNavigate = (page: number) => {
        if (onNavigate) {
            onNavigate(`/${feedType}/${page}`);
        }
    };

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
