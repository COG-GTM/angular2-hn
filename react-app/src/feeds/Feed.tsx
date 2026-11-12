import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

import { FEED_PAGE_SIZE } from '../api/hackernews';
import { useFeed } from '../api/queries';
import { ErrorMessage } from '../components/ErrorMessage';
import { Loader } from '../components/Loader';
import type { FeedType } from '../models';
import { feedListStart } from '../utils/format';
import { FeedItem } from './FeedItem';
import './Feed.scss';

export function Feed({ feedType }: { feedType: FeedType }) {
    const params = useParams<{ page: string }>();
    const pageNum = params.page ? Number(params.page) : 1;
    const { data: items, isError, isPlaceholderData } = useFeed(feedType, pageNum);
    const listStart = feedListStart(pageNum, FEED_PAGE_SIZE);
    const loaded = !!items && !isPlaceholderData;

    useEffect(() => {
        if (loaded) {
            window.scrollTo(0, 0);
        }
    }, [loaded, feedType, pageNum]);

    return (
        <div className="app-feed">
            <div className="main-content">
                {!items && !isError && <Loader />}
                {!items && isError && <ErrorMessage message={`Could not load ${feedType} stories.`} />}

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
        </div>
    );
}
