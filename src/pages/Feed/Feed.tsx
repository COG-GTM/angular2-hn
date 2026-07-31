import { useEffect } from 'react';
import { Link, useParams } from 'react-router';

import { ErrorMessage } from '../../components/ErrorMessage/ErrorMessage';
import { Item } from '../../components/Item/Item';
import { Loader } from '../../components/Loader/Loader';
import { useApiRequest } from '../../hooks/useApiRequest';
import { fetchFeed } from '../../services/hackerNewsApi';

import './Feed.scss';

const PAGE_SIZE = 30;

export function Feed({ feedType }: { feedType: string }) {
    const { page } = useParams();
    const pageNum = Number(page) || 1;

    const { data: items, error } = useApiRequest(
        (signal) => fetchFeed(feedType, pageNum, signal),
        `Could not load ${feedType} stories.`,
        [feedType, pageNum]
    );

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [feedType, pageNum]);

    const listStart = (pageNum - 1) * PAGE_SIZE + 1;

    return (
        <div className="main-content">
            {!items && !error && <Loader />}
            {!items && error !== '' && <ErrorMessage message={error} />}

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
                                <Item item={item} />
                            </li>
                        ))}
                    </ol>
                    <div className="nav">
                        {listStart !== 1 && (
                            <Link to={`/${feedType}/${pageNum - 1}`} className="prev">
                                ‹ Prev
                            </Link>
                        )}
                        {items.length === PAGE_SIZE && (
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
