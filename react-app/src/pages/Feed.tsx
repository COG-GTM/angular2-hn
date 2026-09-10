import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

import Item from '../components/feeds/Item';
import ErrorMessage from '../components/shared/ErrorMessage';
import Loader from '../components/shared/Loader';
import { useFetch } from '../hooks/useFetch';
import type { Story } from '../models/story';
import { fetchFeed } from '../services/hackernews-api';

import './Feed.scss';

export interface FeedProps {
    feedType: string;
}

export default function Feed({ feedType }: FeedProps) {
    const params = useParams();
    const page = params.page ? Number(params.page) : 1;

    const { data: items, error, loading } = useFetch<Story[]>(
        (signal) => fetchFeed(feedType, page, signal),
        [feedType, page]
    );

    useEffect(() => {
        if (items) {
            window.scrollTo(0, 0);
        }
    }, [items]);

    const listStart = (page - 1) * 30 + 1;

    return (
        <div className="main-content">
            {loading && <Loader />}
            {!items && error && <ErrorMessage message={`Could not load ${feedType} stories.`} />}

            {items && (
                <div>
                    {feedType === 'jobs' && (
                        <p className="job-header">
                            These are jobs at startups that were funded by Y Combinator. You can
                            also get a job at a YC startup through{' '}
                            <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
                        </p>
                    )}
                    {feedType !== 'new' && (
                        <ol className={feedType !== 'jobs' ? 'list-margin' : undefined} start={listStart}>
                            {items.map((item) => (
                                <li key={item.id} className="post">
                                    <div className="item-block">
                                        <Item item={item} />
                                    </div>
                                </li>
                            ))}
                        </ol>
                    )}
                    <div className="nav">
                        {listStart !== 1 && (
                            <Link to={`/${feedType}/${page - 1}`} className="prev">
                                ‹ Prev
                            </Link>
                        )}
                        {items.length === 30 && (
                            <Link to={`/${feedType}/${page + 1}`} className="more">
                                More ›
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
