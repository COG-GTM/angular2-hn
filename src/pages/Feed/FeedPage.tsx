import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import Item from '../../components/Item/Item';
import Loader from '../../components/Loader/Loader';
import { fetchFeed } from '../../api/hackerNewsApi';
import { useAsync } from '../../hooks/useAsync';
import type { FeedName } from '../../types';

import './Feed.scss';

const ITEMS_PER_PAGE = 30;

export default function FeedPage({ feedType }: { feedType: FeedName }) {
    const { page } = useParams();
    const pageNum = page ? Number(page) : 1;

    const { data, errorMessage } = useAsync(
        async (signal) => {
            const items = await fetchFeed(feedType, pageNum, signal);

            return { items, listStart: (pageNum - 1) * ITEMS_PER_PAGE + 1 };
        },
        [feedType, pageNum],
        `Could not load ${feedType} stories.`
    );

    useEffect(() => {
        if (data) {
            window.scrollTo(0, 0);
        }
    }, [data]);

    return (
        <div className="feed-page">
            {!data && !errorMessage && <Loader />}
            {!data && errorMessage !== '' && <ErrorMessage message={errorMessage} />}

            {data && (
                <div>
                    {feedType === 'jobs' && (
                        <p className="job-header">
                            These are jobs at startups that were funded by Y Combinator. You can also get a job at a YC
                            startup through <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
                        </p>
                    )}
                    <ol className={feedType !== 'jobs' ? 'list-margin' : undefined} start={data.listStart}>
                        {data.items.map((item) => (
                            <li key={item.id} className="post">
                                <Item item={item} />
                            </li>
                        ))}
                    </ol>
                    <div className="nav">
                        {data.listStart !== 1 && (
                            <Link to={`/${feedType}/${pageNum - 1}`} className="prev">
                                ‹ Prev
                            </Link>
                        )}
                        {data.items.length === ITEMS_PER_PAGE && (
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
