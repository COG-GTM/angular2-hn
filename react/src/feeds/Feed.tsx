import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ErrorMessage } from '../shared/components/ErrorMessage/ErrorMessage';
import { Loader } from '../shared/components/Loader/Loader';
import type { FeedName, Story } from '../shared/models';
import { fetchFeed } from '../shared/services/hackernewsApi';
import { FeedItem } from './FeedItem';
import './Feed.scss';

export const ITEMS_PER_PAGE = 30;

export interface FeedProps {
    feedType: FeedName;
}

function isAbortError(error: unknown): boolean {
    return error instanceof DOMException && error.name === 'AbortError';
}

/** Port of Angular's FeedComponent (src/app/feeds/feed). */
export default function Feed({ feedType }: FeedProps) {
    const { page = '1' } = useParams();
    const pageNum = Number(page) || 1;
    const [items, setItems] = useState<Story[] | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const controller = new AbortController();
        setItems(null);
        setErrorMessage('');
        fetchFeed(feedType, pageNum, controller.signal).then(
            (stories) => {
                if (controller.signal.aborted) {
                    return;
                }
                setItems(stories);
                window.scrollTo(0, 0);
            },
            (error: unknown) => {
                if (!controller.signal.aborted && !isAbortError(error)) {
                    setErrorMessage(`Could not load ${feedType} stories.`);
                }
            }
        );
        return () => controller.abort();
    }, [feedType, pageNum]);

    const listStart = (pageNum - 1) * ITEMS_PER_PAGE + 1;

    return (
        <div className="main-content feed" data-testid="feed" data-feed-type={feedType} data-page={page}>
            {!items && !errorMessage && <Loader />}
            {!items && errorMessage && <ErrorMessage message={errorMessage} />}

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
                        {pageNum > 1 && (
                            <Link to={`/${feedType}/${pageNum - 1}`} className="prev">
                                ‹ Prev
                            </Link>
                        )}
                        {items.length === ITEMS_PER_PAGE && (
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
