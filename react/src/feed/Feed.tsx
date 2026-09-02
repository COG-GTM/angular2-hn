import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { fetchFeed, type FeedName } from '../api/hackernews-api';
import type { Story } from '../models';
import { ErrorMessage, Loader } from '../shared/components';
import { StoryItem } from './StoryItem';
import './feed.scss';

export interface FeedProps {
    feedType: FeedName;
}

interface FeedState {
    key: string;
    items: Story[] | null;
    errorMessage: string;
    listStart: number;
}

const PENDING: Omit<FeedState, 'key'> = { items: null, errorMessage: '', listStart: 1 };

export function Feed({ feedType }: FeedProps) {
    const { page } = useParams<{ page: string }>();
    const pageNum = page ? Number(page) : 1;
    const feedKey = `${feedType}/${pageNum}`;
    const [state, setState] = useState<FeedState>({ key: feedKey, ...PENDING });

    useEffect(() => {
        const controller = new AbortController();

        fetchFeed(feedType, pageNum, controller.signal).then(
            (stories) => {
                if (controller.signal.aborted) {
                    return;
                }
                setState({
                    key: `${feedType}/${pageNum}`,
                    items: stories,
                    errorMessage: '',
                    listStart: (pageNum - 1) * 30 + 1,
                });
                window.scrollTo(0, 0);
            },
            () => {
                if (controller.signal.aborted) {
                    return;
                }
                setState({
                    key: `${feedType}/${pageNum}`,
                    items: null,
                    errorMessage: `Could not load ${feedType} stories.`,
                    listStart: 1,
                });
            }
        );

        return () => controller.abort();
    }, [feedType, pageNum]);

    const current: FeedState = state.key === feedKey ? state : { key: feedKey, ...PENDING };
    const { items, errorMessage, listStart } = current;

    return (
        <div className="main-content">
            {!items && !errorMessage && <Loader />}
            {!items && errorMessage !== '' && <ErrorMessage message={errorMessage} />}

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
                                <StoryItem item={item} />
                            </li>
                        ))}
                    </ol>
                    <div className="nav">
                        {listStart !== 1 && (
                            <Link to={`/${feedType}/${pageNum - 1}`} className="prev">
                                ‹ Prev
                            </Link>
                        )}
                        {items.length === 30 && (
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
