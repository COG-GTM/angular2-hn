import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

import { ErrorMessage } from '../components/ErrorMessage';
import { Item } from '../components/Item';
import { Loader } from '../components/Loader';
import { useAsyncData } from '../hooks/useAsyncData';
import { fetchFeed } from '../services/hackernewsApi';
import type { Story } from '../types';
import './FeedPage.scss';

export function FeedPage({ feedType }: { feedType: string }) {
    const { page } = useParams();
    const pageNum = page ? +page : 1;
    const { data: items, errorMessage } = useAsyncData<Story[]>(
        (signal) => fetchFeed(feedType, pageNum, signal),
        `${feedType}-${pageNum}`,
        `Could not load ${feedType} stories.`
    );
    const listStart = (pageNum - 1) * 30 + 1;

    useEffect(() => {
        if (items) {
            window.scrollTo(0, 0);
        }
    }, [items]);

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
                                <div className="item-block">
                                    <Item item={item} />
                                </div>
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

export default FeedPage;
