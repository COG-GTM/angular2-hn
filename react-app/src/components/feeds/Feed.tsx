import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { Story } from '../../models';
import { fetchFeed } from '../../services/hackernewsApi';
import ErrorMessage from '../shared/ErrorMessage';
import Loader from '../shared/Loader';
import Item from '../feeds/Item';
import './Feed.scss';

export interface FeedProps {
    feedType: string;
}

export default function Feed({ feedType }: FeedProps) {
    const { page } = useParams<{ page: string }>();
    const pageNum = page ? Number(page) : 1;
    const [items, setItems] = useState<Story[] | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const controller = new AbortController();
        setItems(null);
        setErrorMessage('');

        fetchFeed(feedType, pageNum, controller.signal)
            .then((stories) => {
                setItems(stories);
                window.scrollTo(0, 0);
            })
            .catch((error: Error) => {
                if (error.name !== 'AbortError') {
                    setErrorMessage(`Could not load ${feedType} stories.`);
                }
            });

        return () => controller.abort();
    }, [feedType, pageNum]);

    const listStart = (pageNum - 1) * 30 + 1;

    return (
        <div className="main-content">
            {!items && !errorMessage && <Loader />}
            {!items && errorMessage !== '' && <ErrorMessage message={errorMessage} />}

            {items && (
                <div>
                    {feedType === 'jobs' && (
                        <p className="job-header">
                            These are jobs at startups that were funded by Y Combinator. You can also get a job
                            at a YC startup through{' '}
                            <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
                        </p>
                    )}
                    <ol className={feedType !== 'jobs' ? 'list-margin' : undefined} start={listStart}>
                        {items.map((item) => (
                            <li key={item.id} className="post">
                                <Item className="item-block" item={item} />
                            </li>
                        ))}
                    </ol>
                    <div className="nav">
                        {listStart !== 1 && (
                            <Link className="prev" to={`/${feedType}/${pageNum - 1}`}>
                                ‹ Prev
                            </Link>
                        )}
                        {items.length === 30 && (
                            <Link className="more" to={`/${feedType}/${pageNum + 1}`}>
                                More ›
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
