import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchFeed } from '../api/hackerNewsApi';
import { ErrorMessage } from '../components/ErrorMessage/ErrorMessage';
import { FeedItem } from '../components/FeedItem/FeedItem';
import { Loader } from '../components/Loader/Loader';
import type { FeedType, Story } from '../models';
import './FeedPage.scss';

const PAGE_SIZE = 30;

type FeedState = { key: string; items?: Story[]; error?: string };

export default function FeedPage({ feedType }: { feedType: FeedType }) {
    const { page } = useParams();
    const pageNum = Number(page) || 1;
    const key = `${feedType}/${pageNum}`;
    const [state, setState] = useState<FeedState>({ key });

    useEffect(() => {
        const controller = new AbortController();
        fetchFeed(feedType, pageNum, controller.signal).then(
            (items) => {
                if (controller.signal.aborted) return;
                setState({ key, items });
                window.scrollTo(0, 0);
            },
            () => {
                if (!controller.signal.aborted) {
                    setState({ key, error: `Could not load ${feedType} stories.` });
                }
            }
        );
        return () => controller.abort();
    }, [feedType, pageNum, key]);

    const current = state.key === key ? state : { key };
    const listStart = (pageNum - 1) * PAGE_SIZE + 1;

    return (
        <div className="main-content feed" data-testid="feed-page">
            {!current.items && !current.error && <Loader />}
            {!current.items && current.error && <ErrorMessage message={current.error} />}
            {current.items && (
                <div>
                    {feedType === 'jobs' && (
                        <p className="job-header">
                            These are jobs at startups that were funded by Y Combinator. You can also get a job at a YC
                            startup through <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
                        </p>
                    )}
                    <ol className={feedType !== 'jobs' ? 'list-margin' : undefined} start={listStart}>
                        {current.items.map((item) => (
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
                        {current.items.length === PAGE_SIZE && (
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
